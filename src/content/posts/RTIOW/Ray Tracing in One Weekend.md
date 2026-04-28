---
title: Ray Tracing in One Weekend总结
published: 2026-04-23
description: 对RTIOW的浅显理解
image: ./RTIOW.png
tags:
  - 图形学
  - RTIOW
category: 光线追踪
draft: false
pinned: true
---
我自己实现的项目源码在这里:https://github.com/Eureka1029/RayTracing
# 输出图像

如何运行文件  
在当前文件夹的终端中运行
```cmd
g++ main.cpp -o raytracer
./raytracer > image.ppm  
```


### 添加了进度指示器
```cpp {2,5}
for (int j = 0; j < image_height; ++j) {
	std::clog << "\rScanlines remaining: " << (image_height - j) << ' ' << std::flush;
	//....逐个像素设置颜色
}
std::clog << "\rDone.                 \n";
```

# vec3类

这里将point3设置为vec3的别名

重写了大量的运算符

需要记住三个特别的函数
```cpp
inline double dot(const vec3& u, const vec3& v) { //向量点乘
    return u.e[0] * v.e[0]
         + u.e[1] * v.e[1]
         + u.e[2] * v.e[2];
}

inline vec3 cross(const vec3& u, const vec3& v) { //向量叉乘
    return vec3(u.e[1] * v.e[2] - u.e[2] * v.e[1],
                u.e[2] * v.e[0] - u.e[0] * v.e[2],
                u.e[0] * v.e[1] - u.e[1] * v.e[0]);
}

inline vec3 unit_vector(const vec3& v) { //向量归一化
    return v / v.length();
}
```


## 颜色实用函数

`color.h`头文件
```cpp
#include "vec3.h"

#include <iostream>

using color = vec3;

void write_color(std::ostream& out, const color& pixel_color) {
    auto r = pixel_color.x();
    auto g = pixel_color.y();
    auto b = pixel_color.z();

    // Translate the [0,1] component values to the byte range [0,255].
    int rbyte = int(255.999 * r);
    int gbyte = int(255.999 * g);
    int bbyte = int(255.999 * b);

    // Write out the pixel color components.
    out << rbyte << ' ' << gbyte << ' ' << bbyte << '\n';
}
```
> 这里pixel_color是个向量(x,y,z)的取值范围都在0-1之间,因此需要将其映射到0-256的颜色值之间

# 光线、一台简易相机和背景

## Ray类

如何定义一个光线?   $P(t)=A+tb$   
A作为光线的起点,b作为光线的方向

以下是`ray.h`的内容
```cpp
class ray {
  public:
    ray() {}

    ray(const point3& origin, const vec3& direction) : orig(origin), dir(direction) {}

    const point3& origin() const  { return orig; }
    const vec3& direction() const { return dir; }

    point3 at(double t) const {
        return orig + t*dir;
    }

  private:
    point3 orig;
    vec3 dir;
};
```

这里需要注意的是at()函数,能够返回光线在t时到达的点.


## 将光线投射到场景中

光线追踪器的核心思路就是光线射向视口的各个像素并求出其的着色.
1. 计算从“视点”穿过该像素的光线，
2. 确定光线与哪些物体相交，并且
3. 计算最近交点的颜色。

以下代码我们设置了宽高比,并设置了图像宽高和视口的宽高
```cpp
auto aspect_ratio = 16.0 / 9.0;
int image_width = 400;

int image_height = int(image_width / aspect_ratio);
image_height = (image_height < 1) ? 1 : image_height;


auto viewport_height = 2.0;
auto viewport_width = viewport_height * (double(image_width)/image_height);
```
这里存在的问题是,为什么不直接用`aspect_ratio`来求`viewport_width`;原因很简单,`aspect_radio`是理想比例,我们更希望视口的比例和真实的图像宽高比相同.


接下来我们就是在视口中压入像素点.
将摄像机置于点$(0,0,0)$

```cpp
auto camera_center = point3(0, 0, 0);

//计算了代表宽和高的向量
auto viewport_u = vec3(viewport_width, 0, 0);
auto viewport_v = vec3(0, -viewport_height, 0);

//计算了像素的左移和右移间距向量
auto pixel_delta_u = viewport_u / image_width;
auto pixel_delta_v = viewport_v / image_height;

// 计算出视口左上角的坐标
auto viewport_upper_left = camera_center
						 - vec3(0, 0, focal_length) - viewport_u/2 - viewport_v/2;
//计算出左上角第一个像素的坐标
auto pixel00_loc = viewport_upper_left + 0.5 * (pixel_delta_u + pixel_delta_v);
```


做完以上工作后,我们就可以开始渲染了.
```cpp
for (int j = 0; j < image_height; j++) {
	std::clog << "\rScanlines remaining: " << (image_height - j) << ' ' << std::flush;
	for (int i = 0; i < image_width; i++) {
		auto pixel_center = pixel00_loc + (i * pixel_delta_u) + (j * pixel_delta_v);
		//光线方向 = 像素位置 - 摄像机位置
		auto ray_direction = pixel_center - camera_center;
		//定义光线
		ray r(camera_center, ray_direction);
		
		//根据光线的出着色结果
		color pixel_color = ray_color(r);
		//写入颜色
		write_color(std::cout, pixel_color);
	}
}

std::clog << "\rDone.                 \n";
}
```


# 添加一个球体

有了渲染的大致流程,我们要开始设计`ray_color()`函数了.  
我们可以创建一些物体的方程,看看光线是否会和这个物体相交.

## 光线与球面的交点

这里引用原书的推导过程,方便留档记忆.

以原点为中心的半径为 $r$ 的球体方程是一个重要的数学方程：

$$  
x^2 + y^2 + z^2 = r^2  
$$

你也可以将其理解为：如果给定点 $(x, y, z)$ 位于球面上，则  
$$  
x^2 + y^2 + z^2 = r^2  
$$  
如果给定点 $(x, y, z)$ 位于球体内部，则  
$$  
x^2 + y^2 + z^2 < r^2  
$$  
如果给定点 $(x, y, z)$ 位于球体外部，则  
$$  
x^2 + y^2 + z^2 > r^2  
$$

如果我们希望球心位于任意点 $(C_x, C_y, C_z)$，那么该方程就变得不那么简洁了：

$$  
(C_x - x)^2 + (C_y - y)^2 + (C_z - z)^2 = r^2  
$$

在图形学中，你几乎总是希望公式以向量形式表示，这样所有 $x / y / z$ 之类的表达都可以通过一个 vec3 类来简单地表示。你可能会注意到，从点 $P = (x, y, z)$ 到中心点 $C = (C_x, C_y, C_z)$ 的向量是：

$$  
C - P  
$$

如果我们采用内积的定义：

$$  
(C - P) \cdot (C - P) = (C_x - x)^2 + (C_y - y)^2 + (C_z - z)^2  
$$

那么，我们可以将球面的方程用向量形式表示为：

$$  
(C - P) \cdot (C - P) = r^2  
$$

我们可以将其理解为“任何满足该方程的点 $P$ 都位于该球面上”。我们想知道射线  
$P(t) = Q + td$  
是否会在任何位置击中球面。如果它确实击中了球面，那么就存在某个 $t$，使得 $P(t)$ 满足球面方程。因此，我们要寻找任何满足以下条件的 $t$：

$$  
(C - P(t)) \cdot (C - P(t)) = r^2  
$$

可以通过将 $P(t)$ 替换为其展开形式来找到：

$$  
(C - (Q + td)) \cdot (C - (Q + td)) = r^2  
$$

左侧有三个向量，与右侧的三个向量相乘。如果我们计算完整的点积，将会得到九个向量。你当然可以逐项展开计算，但我们没必要这么费劲。如果你还记得，我们要求解 $t$，因此我们将根据是否存在 $t$ 来对各项进行分类：

$$  
(-td + (C - Q)) \cdot (-td + (C - Q)) = r^2  
$$

现在，我们按照向量代数的规则对点积进行分配运算：

$$  
t^2 , d \cdot d - 2t , d \cdot (C - Q) + (C - Q) \cdot (C - Q) = r^2  
$$

将半径的平方移到左边：

$$  
t^2 , d \cdot d - 2t , d \cdot (C - Q) + (C - Q) \cdot (C - Q) - r^2 = 0  
$$

很难看清这个方程的具体形式，但方程中的向量和 $r$ 都是常量且已知。此外，我们所拥有的向量在点积运算后都已化为标量。唯一的未知量是 $t$，且我们有 $t^2$，这意味着该方程是二次方程。

你可以使用二次方程公式来求解：

$$  
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}  
$$

因此，通过求解射线与球面相交方程中的系数，我们可以得到：

$$  
a = d \cdot d  
$$

$$  
b = -2d \cdot (C - Q)  
$$

$$  
c = (C - Q) \cdot (C - Q) - r^2  
$$

利用上述所有内容，你可以求解 $t$，其中有一个平方根项，其值可能是正数（即有两个实数解）、负数（即无实数解）或零（即有一个实数解）。在图形学中，代数表达式几乎总是与几何形状有着非常直接的联系。我们得到的是:
![](../../../images/Pasted%20image%2020260423195249.png)

## 创建我们的第一张光线追踪图像


设置一个半径为0.5,原点在(0,0,-1)的小球
```cpp {1-8,11-12}
bool hit_sphere(const point3& center, double radius, const ray& r) {
    vec3 oc = center - r.origin();
    auto a = dot(r.direction(), r.direction());
    auto b = -2.0 * dot(r.direction(), oc);
    auto c = dot(oc, oc) - radius*radius;
    auto discriminant = b*b - 4*a*c;
    return (discriminant >= 0);
}

color ray_color(const ray& r) {
    if (hit_sphere(point3(0,0,-1), 0.5, r))
        return color(1, 0, 0);

    vec3 unit_direction = unit_vector(r.direction());
    auto a = 0.5*(unit_direction.y() + 1.0);
    return (1.0-a)*color(1.0, 1.0, 1.0) + a*color(0.5, 0.7, 1.0);
}
```

> 基本思路就是解方程,看有没有根,有根就直接画成红色.

结果:
![](../../../images/截屏2026-04-23%2020.09.02.png)

请注意,这里我们的代码没有考虑t的正负,只考虑了是否有交点,因此把球心坐标改成z=+1结果还是一样的(无法区分摄像机前后的物体),后续会解决这个问题.

# 曲面向量与多个对象

## 利用曲面法线进行着色

基本思路:
1. 找出交点
2. 求出法向量并归一化(单位向量)
3. 将其(x,y,z)作为(r,b,g)的项设置颜色

让我们来看看代码:
```cpp
double hit_sphere(const point3& center, double radius, const ray& r) {
    vec3 oc = center - r.origin();
    auto a = dot(r.direction(), r.direction());
    auto b = -2.0 * dot(r.direction(), oc);
    auto c = dot(oc, oc) - radius*radius;
    auto discriminant = b*b - 4*a*c;

    if (discriminant < 0) {
        return -1.0;
    } else {
        return (-b - std::sqrt(discriminant) ) / (2.0*a);
    }
}

color ray_color(const ray& r) {
    auto t = hit_sphere(point3(0,0,-1), 0.5, r);
    if (t > 0.0) {
        vec3 N = unit_vector(r.at(t) - vec3(0,0,-1)); //曲面法向量
        return 0.5*color(N.x()+1, N.y()+1, N.z()+1);
    }

    vec3 unit_direction = unit_vector(r.direction());
    auto a = 0.5*(unit_direction.y() + 1.0);
    return (1.0-a)*color(1.0, 1.0, 1.0) + a*color(0.5, 0.7, 1.0);
}
```

x,y,z 的取值范围在 `[-1,1]`之间,我们需要将它移到`[0,1]`之间,再设置颜色.
看看结果:
![](../../../images/截屏2026-04-23%2020.36.35.png)


## 简化光线与球体相交的代码

将 $b = -2h$带入。  

$$
\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
$$

$$
= \frac{-(-2h) \pm \sqrt{(-2h)^2 - 4ac}}{2a}
$$

$$
= \frac{2h \pm 2\sqrt{h^2 - ac}}{2a}
$$

$$
= \frac{h \pm \sqrt{h^2 - ac}}{a}
$$

这样简化得很漂亮，我们就用它吧。那么，求解 $h$：

$$
b = -2d \cdot (C - Q)
$$

$$
b = -2h
$$

$$
h = \frac{b}{-2} = d \cdot (C - Q)
$$

基于这些观察结果，我们现在可以将球体相交代码简化为如下形式：
```cpp
//main.cpp
double hit_sphere(const point3& center, double radius, const ray& r) {
    vec3 oc = center - r.origin();
    auto a = r.direction().length_squared();
    auto h = dot(r.direction(), oc);
    auto c = oc.length_squared() - radius*radius;
    auto discriminant = h*h - a*c;

    if (discriminant < 0) {
        return -1.0;
    } else {
        return (h - std::sqrt(discriminant)) / a;
    }
}
```

## 可点击对象的抽象概念

创建`hittable.h`头文件

`hit_record`类用来记录光线和面的相交时的点,法线与t.
`hittable`类有一个虚函数`hit()`判断光线是否能够相交


所有物体都继承`hittable`类,以下是球体的类定义
```cpp
#ifndef SPHERE_H
#define SPHERE_H

#include "hittable.h"
#include "vec3.h"

class sphere : public hittable {
  public:
    sphere(const point3& center, double radius) : center(center), radius(std::fmax(0,radius)) {}

    bool hit(const ray& r, double ray_tmin, double ray_tmax, hit_record& rec) const override {
        vec3 oc = center - r.origin();
        auto a = r.direction().length_squared();
        auto h = dot(r.direction(), oc);
        auto c = oc.length_squared() - radius*radius;

        auto discriminant = h*h - a*c;
        if (discriminant < 0)
            return false;

        auto sqrtd = std::sqrt(discriminant);

        //求根公式的两个t,找出离摄像头最近的t
        auto root = (h - sqrtd) / a; //先看-号根,越小越近
        if (root <= ray_tmin || ray_tmax <= root) {  //不在区间内
            root = (h + sqrtd) / a; //再看+号根
            if (root <= ray_tmin || ray_tmax <= root)
                return false;
        }
		
		// 记录
        rec.t = root;
        rec.p = r.at(rec.t);
        rec.normal = (rec.p - center) / radius;

        return true;
    }

  private:
    point3 center;
    double radius;
};

#endif
```


## 正面与背面

这里我们需要设置法线方向始终与光线射入方向相反.
(先计算出朝外的法线,再根据光线和法线的点乘结果判断方向是否相反,不相反就让法线变换符号)

`[hittable.h] 在 hit_record 中添加正面追踪功能`
```cpp {6-11}
class hit_record {
  public:
    point3 p;
    vec3 normal;
    double t;
    bool front_face;

    void set_face_normal(const ray& r, const vec3& outward_normal) {
        front_face = dot(r.direction(), outward_normal) < 0;
        normal = front_face ? outward_normal : -outward_normal;
    }
};
```

在球体类的记录代码中添加以下代码来记录法线.
```cpp {10-11}
class sphere : public hittable {
  public:
    ...
    bool hit(const ray& r, double ray_tmin, double ray_tmax, hit_record& rec) const {
        ...

        rec.t = root;
        rec.p = r.at(rec.t);
        vec3 outward_normal = (rec.p - center) / radius;
        rec.set_face_normal(r, outward_normal);

        return true;
    }
    ...
};
```


## 可击打物体列表

我们添加一个类，用于存储 `hittable` 的列表:
这里使用了智能指针.
```cpp
#include <memory>
#include <vector>

using std::make_shared; 
using std::shared_ptr;

class hittable_list : public hittable {
  public:
    std::vector<shared_ptr<hittable>> objects; //对象数组

    hittable_list() {}
    hittable_list(shared_ptr<hittable> object) { add(object); }

    void clear() { objects.clear(); } //清空

    void add(shared_ptr<hittable> object) {
        objects.push_back(object); //添加元素
    }

    bool hit(const ray& r, double ray_tmin, double ray_tmax, hit_record& rec) const override {
        hit_record temp_rec;
        bool hit_anything = false; 
        auto closest_so_far = ray_tmax;
		
		//遍历所有对象
		//判断是否和光线相交
		//closest_so_far变量的作用是对于当前这个光线,我只保留t最小的,也就是离光源最近的点.所以每次调用ray_tmax都是当前最近的t,意思是我只接受比closest_so_far小的t的点.
		//这里实现了遮挡的逻辑.
        for (const auto& object : objects) {
            if (object->hit(r, ray_tmin, closest_so_far, temp_rec)) {
                hit_anything = true;
                closest_so_far = temp_rec.t;
                rec = temp_rec;
            }
        }

        return hit_anything;
    }
};
```


## 常用常量和辅助函数

定义一些数学变量

```cpp
#ifndef RTWEEKEND_H
#define RTWEEKEND_H

#include <vector>
#include <limits>


// 常量

const double infinity = std::numeric_limits<double>::infinity(); //正无穷
const double pi = 3.1415926535897932385; //pi

// 函数

inline double degrees_to_radians(double degrees) {
    return degrees * pi / 180.0; //角度转为弧度制
}

// Common Headers

#include "color.h"

#endif
```


将我们新增的东西添加到main函数中
```cpp {1-5, 29-33, 8-12, 67}
#include "rtweekend.h"

#include "hittable.h"
#include "hittable_list.h"
#include "sphere.h"


color ray_color(const ray& r, const hittable & world){
    hit_record rec;
    if (world.hit(r, 0, infinity, rec)){
        return 0.5 * (rec.normal + color(1, 1, 1));
    }

    vec3 unit_direction = unit_vector(r.direction());
    auto a = 0.5 * (unit_direction.y() + 1.0);
    return (1.0 - a)*color(1.0, 1.0, 1.0) + a*color(0.5, 0.7, 1.0);
}

int main() {

    // Image
    auto aspect_ratio = 16.0/ 9.0; //设置宽高比,这样不需要同时修改高和宽来修改画面大小
    int image_width = 400;

    //计算高,确保他至少大于等于1.
    int image_height = int(image_width / aspect_ratio);
    image_height = (image_height < 1) ? 1 : image_height;

    // 世界
    hittable_list world;

    world.add(make_shared<sphere>(point3(0,0,-1), 0.5));
    world.add(make_shared<sphere>(point3(0,-100.5,-1),100));


    //相机
    auto focal_length = 1.0; //焦距
    auto viewport_height = 2.0;
    auto viewport_width = viewport_height * (double(image_width)/image_height);
    auto camera_center = point3(0, 0, 0);

    //视口的向量
    auto viewport_u = vec3(viewport_width, 0, 0);
    auto viewport_v = vec3(0, -viewport_height, 0);

    //遍历一个像素在视口上的水平和垂直方向的位移
    auto pixel_delta_u = viewport_u / image_width;
    auto pixel_delta_v = viewport_v / image_height;

    //计算左上角的像素位置
    auto viewport_upper_left = camera_center
                            - vec3(0, 0, focal_length) - viewport_u/2 - viewport_v/2; //视口左上顶点
    auto piexl00_loc = viewport_upper_left + 0.5 * (pixel_delta_u + pixel_delta_v); //第一个像素位置


    // Render

    std::cout << "P3\n" << image_width << ' ' << image_height << "\n255\n";

    for (int j = 0; j < image_height; ++j) {
        std::clog << "\rScanlines remaining: " << (image_height - j) << ' ' << std::flush;
        for (int i = 0; i < image_width; i++) {
            auto pixel_center = piexl00_loc + (i * pixel_delta_u) + (j * pixel_delta_v);
            auto ray_direction = pixel_center - camera_center; //光线方向
            ray r(camera_center, ray_direction);

            color pixel_color = ray_color(r, world);
            write_color(std::cout, pixel_color);
        }
    }

    std::clog << "\rDone.                 \n";
}
```

结果:
![](../../../images/截屏2026-04-27%2015.15.24.png)

## 间隔课程

定义了一个区间类
```cpp
#ifndef INTERVAL_H
#define INTERVAL_H

class interval {
  public:
    double min, max;

    interval() : min(+infinity), max(-infinity) {} // Default interval is empty

    interval(double min, double max) : min(min), max(max) {}

    double size() const { //区间大小
        return max - min;
    }

    bool contains(double x) const { //是否在闭区间内
        return min <= x && x <= max;
    }

    bool surrounds(double x) const { // 是否在开区间内
        return min < x && x < max;
    }

    static const interval empty, universe;
};

const interval interval::empty    = interval(+infinity, -infinity);
const interval interval::universe = interval(-infinity, +infinity);

#endif
```

# 将移动相机代码移至独立类中.

我们来简化一下main文件,创建一个camera类
1. 构造光线并将其投射到场景中
2. 利用这些光线的计算结果来生成渲染图像

在本次重构中，我们将把 `ray_color()` 函数与主程序中的图像、相机和渲染部分合并在一起。新的相机类将包含两个公共方法 `initialize()` 和 `render()` ，以及两个私有辅助方法 `get_ray()`和 `ray_color()` 。

最终，相机将遵循我们能想到的最简单的用法模式：它将通过无参数默认构造，然后拥有者代码通过简单的赋值来修改相机的公共变量，最后通过调用 `initialize()` 函数来初始化所有内容。选择这种模式，是为了避免拥有者需要调用带有大量参数的构造函数，或者定义并调用一大堆设置方法。 相反，拥有代码只需设置其明确关心的部分。最后，我们可以手动让代码调用 `initialize()` ，或者直接让相机在 `render()` 开始时自动调用该函数。我们将采用后者.


以下是`camera.h`完整内容
```cpp

#ifndef CAMERA_H
#define CAMERA_H

#include "hittable.h"


class camera {
public:
    double aspect_ratio = 1.0;  // 图像宽高比（宽 / 高）
    int    image_width  = 100;  // 输出图像宽度（像素）

    void render(const hittable& world) {
        initialize();

        std::cout << "P3\n" << image_width << ' ' << image_height << "\n255\n";

        // 逐行逐列遍历像素并写出颜色。
        for (int j = 0; j < image_height; j++) {
            std::clog << "\rScanlines remaining: " << (image_height - j) << ' ' << std::flush;
            for (int i = 0; i < image_width; i++) {
                auto pixel_center = pixel00_loc + (i * pixel_delta_u) + (j * pixel_delta_v);
                auto ray_direction = pixel_center - center;
                ray r(center, ray_direction);

                color pixel_color = ray_color(r, world);
                write_color(std::cout, pixel_color);
            }
        }

        std::clog << "\rDone.                 \n";
    }

private:
    int    image_height;   // 输出图像高度（像素）
    point3 center;         // 相机中心
    point3 pixel00_loc;    // 左上角第一个像素中心位置
    vec3   pixel_delta_u;  // 向右一个像素的位移
    vec3   pixel_delta_v;  // 向下一个像素的位移

    void initialize() {
        // 根据宽高比计算高度，并保证至少为 1。
        image_height = int(image_width / aspect_ratio);
        image_height = (image_height < 1) ? 1 : image_height;

        // 相机位于原点。
        center = point3(0, 0, 0);

        // 计算视口尺寸。
        auto focal_length = 1.0;
        auto viewport_height = 2.0;
        auto viewport_width = viewport_height * (double(image_width)/image_height);

        // 计算视口水平和竖直方向边向量。
        auto viewport_u = vec3(viewport_width, 0, 0);
        auto viewport_v = vec3(0, -viewport_height, 0);

        // 计算像素间在水平和竖直方向的步进向量。
        pixel_delta_u = viewport_u / image_width;
        pixel_delta_v = viewport_v / image_height;

        // 计算视口左上角以及首像素中心位置。
        auto viewport_upper_left =
            center - vec3(0, 0, focal_length) - viewport_u/2 - viewport_v/2;
        pixel00_loc = viewport_upper_left + 0.5 * (pixel_delta_u + pixel_delta_v);
    }

    color ray_color(const ray& r, const hittable& world) const {
        hit_record rec;

        // 命中物体时根据法线返回可视化颜色。
        if (world.hit(r, interval(0, infinity), rec)) {
            return 0.5 * (rec.normal + color(1,1,1));
        }

        // 未命中时返回天空渐变背景。
        vec3 unit_direction = unit_vector(r.direction());
        auto a = 0.5*(unit_direction.y() + 1.0);
        return (1.0-a)*color(1.0, 1.0, 1.0) + a*color(0.5, 0.7, 1.0);
    }
};

#endif
```

我们可以对main.h内容进行简化了
```cpp
#include "rtweekend.h"
#include "hittable.h"
#include "hittable_list.h"
#include "sphere.h"
#include "camera.h"



int main() {
    hittable_list world;

    world.add(make_shared<sphere>(point3(0,0,-1), 0.5));
    world.add(make_shared<sphere>(point3(0,-100.5,-1), 100));

    camera cam;

    cam.aspect_ratio = 16.0 / 9.0;
    cam.image_width  = 400;

    cam.render(world);
}
```

# 抗锯齿

这里的实现思路:以像素为中心,对四个像素(各延伸一半距离)的正方形区域进行采样.  
(一个像素采样四次取平均)

## 一些随机数工具

返回一个落在$0 <= n < 1$ 范围内的数值

为`rtweekend.h`添加以下内容:
```cpp
#include <cstdlib>
inline double random_double() {
    return std::rand() / (RAND_MAX + 1.0); // 返回数值处于[0,1)
}

inline double random_double(double min, double max) {
    return min + (max - min)*random_double(); //返回数值处于[min,max)
}
```

## 使用多重采样生成像素

在像素周围选取多个采样点取平均去计算着色

完整思路:首先，我们将更新 `write_color()` 函数以考虑所使用的采样次数：我们需要计算所有采样点的平均值。为此，我们将每次迭代的完整颜色相加，然后在输出颜色之前，最后进行一次除法（除以采样次数）


我们需要确保最后计算出的颜色在正确的`[0,1]`范围内,在`interval.h`添加以下函数
```cpp
double clamp(double x) const { //限制数在某一区间内
	if(x < min) return min;
	if(x > max) return max;
	return x;
}
```


修改write_color函数逻辑
```cpp
static const interval intensity(0.000, 0.999);
int rbyte = int(256 * intensity.clamp(r));
int gbyte = int(256 * intensity.clamp(g));
int bbyte = int(256 * intensity.clamp(b));
```

修改camera类
```cpp {12, 22-27, 37, 47, 71-85}

#ifndef CAMERA_H
#define CAMERA_H

#include "hittable.h"


class camera {
public:
    double aspect_ratio = 1.0;  // 图像宽高比（宽 / 高）
    int    image_width  = 100;  // 输出图像宽度（像素）
    int    samples_per_pixel = 10; //一个像素的采样点数量
    void render(const hittable& world) {
        initialize();

        std::cout << "P3\n" << image_width << ' ' << image_height << "\n255\n";

        // 逐行逐列遍历像素并写出颜色。
        for (int j = 0; j < image_height; j++) {
            std::clog << "\rScanlines remaining: " << (image_height - j) << ' ' << std::flush;
            for (int i = 0; i < image_width; i++) {
                color pixel_color(0,0,0);
                for(int sample = 0; sample < samples_per_pixel; sample++){
                    ray r = get_ray(i, j);
                    pixel_color += ray_color(r, world);
                }
                write_color(std::cout, pixel_samples_scale * pixel_color);
            }
        }

        std::clog << "\rDone.                 \n";
    }

private:
    int    image_height;   // 输出图像高度（像素）
    point3 center;         // 相机中心
    double pixel_samples_scale; //所有像素采样点颜色规模因子
    point3 pixel00_loc;    // 左上角第一个像素中心位置
    vec3   pixel_delta_u;  // 向右一个像素的位移
    vec3   pixel_delta_v;  // 向下一个像素的位移

    void initialize() {
        // 根据宽高比计算高度，并保证至少为 1。
        image_height = int(image_width / aspect_ratio);
        image_height = (image_height < 1) ? 1 : image_height;

        pixel_samples_scale = 1.0 / samples_per_pixel;

        // 相机位于原点。
        center = point3(0, 0, 0);

        // 计算视口尺寸。
        auto focal_length = 1.0;
        auto viewport_height = 2.0;
        auto viewport_width = viewport_height * (double(image_width)/image_height);

        // 计算视口水平和竖直方向边向量。
        auto viewport_u = vec3(viewport_width, 0, 0);
        auto viewport_v = vec3(0, -viewport_height, 0);

        // 计算像素间在水平和竖直方向的步进向量。
        pixel_delta_u = viewport_u / image_width;
        pixel_delta_v = viewport_v / image_height;

        // 计算视口左上角以及首像素中心位置。
        auto viewport_upper_left =
            center - vec3(0, 0, focal_length) - viewport_u/2 - viewport_v/2;
        pixel00_loc = viewport_upper_left + 0.5 * (pixel_delta_u + pixel_delta_v);
    }

    ray get_ray(int i, int j) const {
        auto offset = sample_square();
        auto pixel_sample = pixel00_loc
                            + ((i + offset.x())) * pixel_delta_u
                            + ((j + offset.y())) * pixel_delta_v; //计算出采样点坐标

        auto ray_origin = center;
        auto ray_direction = pixel_sample - ray_origin;

        return ray(ray_origin, ray_direction);
    }

    vec3 sample_square() const { //作用在步长上的偏移系数
        return vec3(random_double() - 0.5, random_double() - 0.5, 0);
    }

    color ray_color(const ray& r, const hittable& world) const {
        hit_record rec;

        // 命中物体时根据法线返回可视化颜色。
        if (world.hit(r, interval(0, infinity), rec)) {
            return 0.5 * (rec.normal + color(1,1,1));
        }

        // 未命中时返回天空渐变背景。
        vec3 unit_direction = unit_vector(r.direction());
        auto a = 0.5*(unit_direction.y() + 1.0);
        return (1.0-a)*color(1.0, 1.0, 1.0) + a*color(0.5, 0.7, 1.0);
    }
};

#endif
```

效果对比
![](../../../images/截屏2026-04-27%2017.44.09.png)



# 漫反射材料

我们这里采用几何和材质分离的方式实现,也就是可以将一种材质分配给多个球体.


假设这里表面性质是将接收到的光,随机且均匀地向各个方向散射,光线以相同的概率向任何远离表面的方向散射.


实现在vec3类中实现生成随机向量的功能;
```cpp
static vec3 random() {
	return vec3(random_double(), random_double(), random_double());
}

static vec3 random(double min, double max) {
	return vec3(random_double(min,max), random_double(min,max), random_double(min,max));
}
```

这里的问题是我们生成的任意方向的向量,但是实际上我们只需要表面半球的向量,本书使用了剔除法(不断生成,直到找到一个合格的向量)

1. 在单位球体内生成一个随机向量
2. 将该向量归一化，使其投影到球面上
3. 如果归一化向量落在错误的半球上，则对其进行反转


`[vec3.h]`
random_unit_vector()函数第一版:  
实现在单位球中生成一个随机向量,要求这个随机向量必须在单位球内.
```cpp
inline vec3 random_unit_vector() {
    while(true){
        auto p = vec3::random(-1,1);
        auto lensq = p.length_squared(); 
        if(lensq <= 1)
            return p / sqrt(lensq); //归一化
    }
}
```


剔除掉离中心点特别近的点,避免因为精度出现无效向量
```cpp
inline vec3 random_unit_vector() {
    while (true) {
        auto p = vec3::random(-1,1);
        auto lensq = p.length_squared();
        if (1e-160 < lensq && lensq <= 1)
            return p / sqrt(lensq);
    }
}
```

`[vec3.h]`
如何剔除? 计算和曲面法线点积!点积为负就进行反转
```cpp
inline vec3 random_on_hemisphere(const vec3& normal) {
    vec3 on_unit_sphere = random_unit_vector();
    if (dot(on_unit_sphere, normal) > 0.0) // In the same hemisphere as the normal
        return on_unit_sphere;
    else
        return -on_unit_sphere;
}
```


修改`camera.h`
这里的问题是没有限制子光线的数量
```cpp {8-11}
class camera {
  ...
  private:
    ...
    color ray_color(const ray& r, const hittable& world) const {
        hit_record rec;

        if (world.hit(r, interval(0, infinity), rec)) {
            vec3 direction = random_on_hemisphere(rec.normal);
            return 0.5 * ray_color(ray(rec.p, direction), world);
        }

        vec3 unit_direction = unit_vector(r.direction());
        auto a = 0.5*(unit_direction.y() + 1.0);
        return (1.0-a)*color(1.0, 1.0, 1.0) + a*color(0.5, 0.7, 1.0);
    }
};
```

## 限制子射线的数量

只需要在camera设置一个max_depth变量,每次反射都让其减一即可.
在ray_color中设置终止条件即可.

这里球体的颜色其实是,天空中


## 改善阴影痘问题

由于精度问题,求出的交点可能会在表面以下,散射出来的光线又会碰到表面.

我们只需要修改ray_color函数,限定t的范围即可`[camera.h]`
```cpp {1}
if (world.hit(r, interval(0.001, infinity), rec)) {
	vec3 direction = random_on_hemisphere(rec.normal);
	return 0.5 * ray_color(ray(rec.p, direction),depth-1, world);
}
```

这个新增的0.001含义很简单,我希望新射出来的光线与表面的交点不要和我漫反射的交点那么近,否则我认为是阴影痘现象.


## 真正的朗伯反射(Lambertian Reflection)

朗伯分布:这种分布将反射光线以与 cos(ϕ) 成正比的方式散射，其中 ϕ 是反射光线与表面法线之间的夹角

实现的改动
```cpp {2}
if (world.hit(r, interval(0.001, infinity), rec)) {
	vec3 direction = rec.normal + random_unit_vector(); //相当于对一个表面向量增加一个随机扰动
	return 0.5 * ray_color(ray(rec.p, direction),depth-1, world);
}
```

更多的光线向法线方向附近反射了


## 使用伽马矫正实现准确的色彩饱和度

几乎所有的计算机程序都假设图像在写入图像文件之前已经过“伽马校正”。 这意味着在将 0 到 1 的数值存储为字节之前，这些数值已经过某种变换处理。数据在写入时未经过变换的图像被称为处于线性空间，而经过变换的图像则被称为处于伽马空间。你所使用的图像查看器很可能期望接收的是伽马空间的图像，但我们提供给它的却是线性空间的图像。


`color.h` write_color()函数进行伽马矫正
```cpp {1-6, 13-16}
inline double linear_to_gamma(double linear_component){
    if(linear_component > 0)
        return std::sqrt(linear_component);
    
    return 0;
}

inline void write_color(std::ostream& out, const color& pixel_color) {
    auto r = pixel_color.x();
    auto g = pixel_color.y();
    auto b = pixel_color.z();

    // Apply a linear to gamma transform for gamma 2
    r = linear_to_gamma(r);
    g = linear_to_gamma(g);
    b = linear_to_gamma(b);

    // Translate the [0,1] component values to the byte range [0,255].
    static const interval intensity(0.000, 0.999);
    int rbyte = int(256 * intensity.clamp(r));
    int gbyte = int(256 * intensity.clamp(g));
    int bbyte = int(256 * intensity.clamp(b));


    // Write out the pixel color components.
    out << rbyte << ' ' << gbyte << ' ' << bbyte << '\n';
}
```

## 金属

## 一个用于材料的抽象类

对于一个材质,我们需要知道的是他吸收多少光,以及反射光是什么.

scatter函数的返回值含义是产不产生散射
```cpp
#ifndef MATERIAL_H
#define MATERIAL_H

#include "hittable.h"
#include "color.h"

class material {
    public:
        virtual ~material() = default;

        virtual bool scatter(
            const ray& r_in, const hit_record& rec, color& attenuation, ray& scattered
        ) const {
            return false;
        }
        
};

#endif
```


在hittable.h添加材质指针的记录
```cpp
shared_ptr<material> mat;
```

当光线击中一个表面（例如某个特定的球体）时， `hit_record` 中的材质指针将被设置为指向该球体在开始时于 `main()` 中创建时所赋予的材质指针。 当 `ray_color()` 例程接收到 `hit_record` 时，它可以调用材质指针的成员函数，以确定是否有光线被散射，以及具体是哪条光线。

```cpp {14,22}
class sphere : public hittable {
  public:
    sphere(const point3& center, double radius) : center(center), radius(std::fmax(0,radius)) {
        // TODO: Initialize the material pointer `mat`.
    }

    bool hit(const ray& r, interval ray_t, hit_record& rec) const override {
        ...

        rec.t = root;
        rec.p = r.at(rec.t);
        vec3 outward_normal = (rec.p - center) / radius;
        rec.set_face_normal(r, outward_normal);
        rec.mat = mat;

        return true;
    }

  private:
    point3 center;
    double radius;
    shared_ptr<material> mat;
};
```


## 光散射与反射的建模

albedo(反射率).

朗伯（漫反射）反射率要么总是按照其反射率 R 散射并衰减光线，要么有时（以概率 1−R ）散射光线而不衰减

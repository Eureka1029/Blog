---
title: Ray Tracing in One Weekend
published: 2026-04-23
description: 对RTIOW的浅显理解
image: ./RTIOW.png
tags:
  - 图形学
  - RTIOW
category: RTIOW
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
```cpp {2,6}
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




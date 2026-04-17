---
title: Tinyrenderer(软光栅器)总结
published: 2026-04-17
description: 对tinyrenderer的浅显理解
image: ./diablo3.png
tags:
  - 软件光栅器
  - 图形学
category: 软件光栅器
draft: false
---
具体项目源码在这:
https://github.com/Eureka1029/my_tinyrenderer

## 初始化

设置相机位置  (位置,方向,向上向量决定了待会如何将物体进行旋转)
设置输出图像大小  
设置光源位置  
设置阴影贴图尺寸 (这里设置为$8000*8000$使用暴力的方式来解决光源视图和相机视图间像素被拉伸的影响,避免出现阴影锯齿)
```cpp
    // 输出图像尺寸
    constexpr int width  = 800;
    constexpr int height = 800;
    // 阴影贴图缓冲区尺寸
    constexpr int shadoww = 8000;
    constexpr int shadowh = 8000;
    // 光源位置
    constexpr vec3  light{ 1, 1, 1};
    // 相机位置
    constexpr vec3    eye{-1, 0, 2};
    // 相机看向位置
    constexpr vec3 center{ 0, 0, 0};
    // 相机上向量
    constexpr vec3     up{ 0, 1, 0};

```


初始化MVP矩阵
`norm()` 求出向量的模
```cpp
    lookat(eye, center, up);
    init_perspective(norm(eye-center));
    init_viewport(width/16, height/16, width*7/8, height*7/8);
    init_zbuffer(width, height);
    // 创建帧缓冲区并用背景颜色初始化
    TGAImage framebuffer(width, height, TGAImage::RGB, {177, 195, 209, 255});
```

lootat()初始化
ModelView实现效果假定相机永远在原点 $(0,0,0)$ 且朝向固定。`View` 矩阵的作用是**将整个世界（包含所有物体）平移 `-eye` 的距离，并进行反向旋转**，使得所有物体最终落在以相机为原点的相对坐标系（Camera/View Space）中
```cpp
void lookat(const vec3 eye, const vec3 center, const vec3 up) {
    // 计算相机坐标系的三个基向量
    vec3 n = normalized(eye-center);      // 相机前方向量
    vec3 l = normalized(cross(up,n));     // 相机右向量
    vec3 m = normalized(cross(n, l));     // 相机上向量
    // ModelView = 旋转矩阵 * 平移矩阵
    ModelView = mat<4,4>{{{l.x,l.y,l.z,0}, {m.x,m.y,m.z,0}, {n.x,n.y,n.z,0}, {0,0,0,1}}} *
                mat<4,4>{{{1,0,0,-center.x}, {0,1,0,-center.y}, {0,0,1,-eye.z}, {0,0,0,1}}};
}
```


init_perspective()透视矩阵初始化.这里没有考虑宽高比的影响,而是直接用相似得出
```cpp
void init_perspective(const double f) {
    Perspective = {{{1,0,0,0}, {0,1,0,0}, {0,0,1,0}, {0,0, -1/f,1}}};
}
```

init_viewport()
初始化视口变换矩阵,将在`[-1,1]^3`的物体坐标转换为屏幕坐标
```cpp
void init_viewport(const int x, const int y, const int w, const int h) {
    Viewport = {{{w/2., 0, 0, x+w/2.}, {0, h/2., 0, y+h/2.}, {0,0,1,0}, {0,0,0,1}}};
}
```


init_zbuffer()
初始化深度缓冲区,并给定一个很小的负数作为初始值.
```cpp
void init_zbuffer(const int width, const int height) {
    zbuffer = std::vector<double>(width*height, -1000.);
}
```

## 渲染管线

### 顶点处理
遍历所有的面,取出所有的点,进行处理
```cpp
for (int m=1; m<argc; m++) {
        // 加载模型数据
        Model model(argv[m]);
        PhongShader shader(light, model);
        // 对所有面进行迭代
        for (int f=0; f<model.nfaces(); f++) {
            // 组装图元
            Triangle clip = { shader.vertex(f, 0),
                              shader.vertex(f, 1),
                              shader.vertex(f, 2) };
            // 光栅化图元
            rasterize(clip, shader, framebuffer);
        }
    }
```

vertex()顶点着色器
`normal()`获得顶点法线
`invert_transpose()` 矩阵逆矩阵转置
```cpp
virtual vec4 vertex(const int face, const int vert) {
	varying_uv[vert]  = model.uv(face, vert); //获得uv坐标
	varying_nrm[vert] = ModelView.invert_transpose() * model.normal(face, vert); //将法线转化到相机坐标系中
	vec4 gl_Position = ModelView * model.vert(face, vert);  //将顶点的局部/世界坐标，乘以视图矩阵（ModelView），转换到相机/视图空间（View Space）。也就是把物体拉到了以相机为原点的坐标系里。
	tri[vert] = gl_Position; //把转换到相机空间的顶点坐标缓存到 `tri` 数组中。
	// 返回裁剪坐标
	return Perspective * gl_Position; //返回的是透视投影后的矩阵,这里要注意w != 0了,而是包含了深度信息..
}
```

结论: 让法线转化到相机坐标系,必须乘以逆转置矩阵
`Perspective * gl_Position` 相当于进行透视投影,并将深度信息存储到了w分量上.


### 三角形处理
将处理后的顶点组成图元(形成三角形)
```cpp
Triangle clip = { shader.vertex(f, 0),
				  shader.vertex(f, 1),
				  shader.vertex(f, 2) };
```


### 光栅化

```cpp
// 光栅化三角形：将裁剪坐标中的三角形转换为屏幕像素
void rasterize(const Triangle &clip, const IShader &shader, TGAImage &framebuffer) {
    // 将齐次坐标转换为标准化设备坐标（NDC）
    vec4 ndc[3]    = { clip[0]/clip[0].w, clip[1]/clip[1].w, clip[2]/clip[2].w };
    // 使用视口矩阵将 NDC 转换为屏幕坐标
    vec2 screen[3] = { (Viewport*ndc[0]).xy(), (Viewport*ndc[1]).xy(), (Viewport*ndc[2]).xy() };

    // 将三个顶点组成矩阵用于重心坐标计算
    mat<3,3> ABC = {{ {screen[0].x, screen[0].y, 1.}, {screen[1].x, screen[1].y, 1.}, {screen[2].x, screen[2].y, 1.} }};
    // 背面剔除 + 剔除面积小于一个像素的三角形
    if (ABC.det()<1) return;

    // 计算三角形的外包矩形框（左上角和右下角）
    auto [bbminx,bbmaxx] = std::minmax({screen[0].x, screen[1].x, screen[2].x});
    auto [bbminy,bbmaxy] = std::minmax({screen[0].y, screen[1].y, screen[2].y});
    // 使用 OpenMP 并行处理每个像素
#pragma omp parallel for
    for (int x=std::max<int>(bbminx, 0); x<=std::min<int>(bbmaxx, framebuffer.width()-1); x++) {
        for (int y=std::max<int>(bbminy, 0); y<=std::min<int>(bbmaxy, framebuffer.height()-1); y++) {
            // 计算像素点 {x,y} 相对于三角形的重心坐标（屏幕空间）
            vec3 bc_screen = ABC.invert_transpose() * vec3{static_cast<double>(x), static_cast<double>(y), 1.};
            // 转换为裁剪空间的重心坐标，处理透视变形问题
            vec3 bc_clip   = { bc_screen.x/clip[0].w, bc_screen.y/clip[1].w, bc_screen.z/clip[2].w };
            // 归一化重心坐标
            bc_clip = bc_clip / (bc_clip.x + bc_clip.y + bc_clip.z);
            // 屏幕空间重心坐标为负表示像素在三角形外部
            if (bc_screen.x<0 || bc_screen.y<0 || bc_screen.z<0) continue;
            // 线性插值计算像素的深度值
            double z = bc_screen * vec3{ ndc[0].z, ndc[1].z, ndc[2].z };
            // 深度测试：丢弃深度值不符合条件的片段
            if (z <= zbuffer[x+y*framebuffer.width()]) continue;
            // 调用片段着色器
            auto [discard, color] = shader.fragment(bc_clip);
            // 片段着色器可以丢弃当前片段
            if (discard) continue;
            // 更新深度缓冲区
            zbuffer[x+y*framebuffer.width()] = z;
            // 更新帧缓冲区
            framebuffer.set(x, y, color);
        }
    }
}
```


**将坐标标准化并转化到屏幕上**
```cpp
vec4 ndc[3]    = { clip[0]/clip[0].w, clip[1]/clip[1].w, clip[2]/clip[2].w }; //除以w分量,转化为一个标准点坐标

vec2 screen[3] = { (Viewport*ndc[0]).xy(), (Viewport*ndc[1]).xy(), (Viewport*ndc[2]).xy() }; //得到三角形的三个点在屏幕的坐标
```

**计算该三角形叉乘来判断方向(右手定理)**
```cpp
mat<3,3> ABC = {{ {screen[0].x, screen[0].y, 1.}, {screen[1].x, screen[1].y, 1.}, {screen[2].x, screen[2].y, 1.} }};
    // 背面剔除 + 剔除面积小于一个像素的三角形
if (ABC.det()<1) return;
```
`det()`是计算行列式
该矩阵计算行列式的结果:
$$(x_1 - x_0)(y_2 - y_0) - (x_2 - x_0)(y_1 - y_0)$$
正好是三角形叉乘.如果太小或者直接小于0,不进行光栅化了.


**计算屏幕三角形的包围盒**
```cpp
auto [bbminx,bbmaxx] = std::minmax({screen[0].x, screen[1].x, screen[2].x});
auto [bbminy,bbmaxy] = std::minmax({screen[0].y, screen[1].y, screen[2].y});
```


**处理每个像素**

求出重心坐标的权重 $(u, v, w)$
```cpp
vec3 bc_screen = ABC.invert_transpose() * vec3{static_cast<double>(x), static_cast<double>(y), 1.};
```
原理:
$$\begin{bmatrix} x_0 & x_1 & x_2 \\ y_0 & y_1 & y_2 \\ 1 & 1 & 1 \end{bmatrix} \begin{bmatrix} u \\ v \\ w \end{bmatrix} = \begin{bmatrix} x \\ y \\ 1 \end{bmatrix}$$ 
$$ABC = \begin{bmatrix} x_0 & y_0 & 1 \\ x_1 & y_1 & 1 \\ x_2 & y_2 & 1 \end{bmatrix}$$ 
$$ABC^T \cdot \vec{bc} = P$$ 

$$\vec{bc} = (ABC^T)^{-1} \cdot P$$


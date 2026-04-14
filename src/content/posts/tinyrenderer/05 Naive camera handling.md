---
title: 05 Naive camera handling
published: 2026-04-15
description: Lesson 5
image: ""
tags:
  - tinyrenderer
  - 图形学
category: tinyrenderer
draft: false
---
## 正交投影旋转效果

> 修改原main函数
```cpp
vec3 rot(vec3 v) {
    constexpr double a = M_PI/6;
    const mat<3,3> Ry = {{{std::cos(a), 0, std::sin(a)}, {0,1,0}, {-std::sin(a), 0, std::cos(a)}}};
    return Ry*v;
}

int main(int argc, char** argv) {
    if (argc != 2) {
        std::cerr << "Usage: " << argv[0] << " obj/model.obj" << std::endl;
        return 1;
    }

    Model model(argv[1]);
    TGAImage framebuffer(width, height, TGAImage::RGB);
    TGAImage     zbuffer(width, height, TGAImage::GRAYSCALE);

    for (int i=0; i<model.nfaces(); i++) { // iterate through all triangles
        auto [ax, ay, az] = project(rot(model.vert(i, 0)));
        auto [bx, by, bz] = project(rot(model.vert(i, 1)));
        auto [cx, cy, cz] = project(rot(model.vert(i, 2)));
        TGAColor rnd;
        for (int c=0; c<3; c++) rnd[c] = std::rand()%255;
        triangle(ax, ay, az, bx, by, bz, cx, cy, cz, zbuffer, framebuffer, rnd);
    }

    framebuffer.write_tga_file("framebuffer.tga");
    zbuffer.write_tga_file("zbuffer.tga");
    return 0;
}
```

![](../../../images/截屏2026-04-14%2018.47.48.png)![](../../../images/截屏2026-04-14%2018.49.12.png)


## 透视投影旋转图像
公式证明过程在:  
https://haqr.eu/tinyrenderer/camera-naive/
```cpp
vec3 persp(vec3 v){
    constexpr int c = 3;
    return v / (1 - v.z/c);
}

int main(int argc, char** argv) {

    const char* filename = "african_head.obj"; 

    if (argc == 2) {
        filename = argv[1];
    } else if (argc > 2) {
        // 防止乱传参数
        std::cerr << "Usage: " << argv[0] << " [obj/model.obj]" << std::endl;
        return 1;
    }

    // 3. 把最终确定的路径塞给 Model
    Model model(filename);
    TGAImage framebuffer(width, height, TGAImage::RGB);
    TGAImage     zbuffer(width, height, TGAImage::GRAYSCALE);

    for (int i=0; i<model.nfaces(); i++) { // iterate through all triangles
        auto [ax, ay, az] = project(persp(rot(model.vert(i, 0))));
        auto [bx, by, bz] = project(persp(rot(model.vert(i, 1))));
        auto [cx, cy, cz] = project(persp(rot(model.vert(i, 2))));
        TGAColor rnd;
        for (int c=0; c<3; c++) rnd[c] = std::rand()%255;
        triangle(ax, ay, az, bx, by, bz, cx, cy, cz, zbuffer, framebuffer, rnd);
    }

    framebuffer.write_tga_file("framebuffer.tga");
    zbuffer.write_tga_file("zbuffer.tga");
    return 0;
}
```

效果:
![](../../../images/截屏2026-04-14%2018.51.00.png)
![](../../../images/截屏2026-04-14%2018.51.12.png)

much better!


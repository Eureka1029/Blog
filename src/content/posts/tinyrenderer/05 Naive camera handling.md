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


会出现的问题:
由于zbuffer存储的是8bit的数据,也就是说只能存0-255的深度值,一旦深度过大(右手系),会出现溢出现象,导致原本很近的面被远处的面给覆盖了.

![](../../../images/Pasted%20image%2020260415132132.png)


那我们就需要对深度的存储方式进行修改.
定义zbuffer为double数组
修改triangle函数逻辑
```cpp
double* zbuffer = new double [width * height];
for (int i = 0; i < width * height; i++) {
	zbuffer[i] = -std::numeric_limits<double>::max();
}

void triangle(int ax, int ay, double az, int bx, int by, double bz, int cx, int cy, double cz, double* zbuffer, TGAImage &framebuffer, TGAColor color) {
int bbminx = std::max(0, std::min({ax, bx, cx}));
    int bbminy = std::max(0, std::min({ay, by, cy}));
    int bbmaxx = std::min(width - 1, std::max({ax, bx, cx}));
    int bbmaxy = std::min(height - 1, std::max({ay, by, cy}));
    double total_area = signed_triangle_area(ax, ay, bx, by, cx, cy);
    if (total_area<1) return; // backface culling + discarding triangles that cover less than a pixel

#pragma omp parallel for
    for (int x=bbminx; x<=bbmaxx; x++) {
        for (int y=bbminy; y<=bbmaxy; y++) {
            double alpha = signed_triangle_area(x, y, bx, by, cx, cy) / total_area;
            double beta  = signed_triangle_area(x, y, cx, cy, ax, ay) / total_area;
            double gamma = signed_triangle_area(x, y, ax, ay, bx, by) / total_area;
            if (alpha<0 || beta<0 || gamma<0) continue; // negative barycentric coordinate => the pixel is outside the triangle
            double z = alpha * az + beta * bz + gamma * cz;
            int idx = x + y * width;
            if(zbuffer[idx] >= z) continue;
            zbuffer[idx] = z;
            framebuffer.set(x, y, color);
        }
    }
}
```


利用zbuffer数组画出深度图:
```cpp
double min_z = std::numeric_limits<double>::max();
    double max_z = -std::numeric_limits<double>::max();
    for(int i = 0; i < height * width; i++){
        if(zbuffer[i] != -std::numeric_limits<double>::max()){
            if(zbuffer[i] < min_z) min_z = zbuffer[i];
            if(zbuffer[i] > max_z) max_z = zbuffer[i];
        }
    }

    for(int x = 0; x < width; x++){
        for(int y = 0; y < height; y++){
            int idx = x + y * width;
            double z = zbuffer[idx];
            if(z != -std::numeric_limits<double>::max()){
                unsigned char c = static_cast<unsigned char>((z - min_z) / (max_z - min_z) * 255);
                zbuffer_image.set(x, y, TGAColor({c, c, c, 255}));
            }
        }
    }
```


![](../../../images/截屏2026-04-15%2014.12.50.png)

![](../../../images/截屏2026-04-15%2014.13.00.png)
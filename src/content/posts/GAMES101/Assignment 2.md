---
title: "GAMES101 作业2:  Triangles and Z-buffering"
published: 2026-03-29
description: GAMES101 作业2
image: ""
tags:
  - GAMES101
category: GAMES101
draft: false
---
## 作业2：Triangles and Z-buffering

在上次作业中，虽然我们在屏幕上画出一个线框三角形，但这看起来并不是那么的有趣。所以这一次我们继续推进一步——在屏幕上画出一个实心三角形，换言之，栅格化一个三角形。上一次作业中，在视口变化之后，我们调用了函数rasterize_wireframe(const Triangle& t)。但这一次，你需要自己填写并调用函数rasterize_triangle(const Triangle& t)。

### 主要任务：

- 补全rasterize_triangle()函数、insideTriangle()函数和get_projection_matrix()函数
- get_projection_matrix()函数：使用作业一中的该函数即可。
- insideTriangle()函数：

- 注意：将传入参数类型由 int 修改为 float ，便于传入非整数坐标使用该函数
- 叉积公式： ![](../../../images/Pasted%20image%2020260409080918.png)

```cpp
static bool insideTriangle(float x, float y, const Vector3f* _v)
{   
    // TODO : Implement this function to check if the point (x, y) is inside the triangle represented by _v[0], _v[1], _v[2]
    Vector3f A, B, C, P;
    A = _v[0];
    B = _v[1];
    C = _v[2];
    P = { x, y, 0 };    // 待测点，z值不影响二维叉积计算

    Vector3f AB, BC, CA, AP, BP, CP;
    AB = B - A; BC = C - B; CA = A - C;
    AP = P - A; BP = P - B; CP = P - C;

    // 计算二维叉积（只计算z分量）
    float cross1 = AB.x() * AP.y() - AB.y() * AP.x();
    float cross2 = BC.x() * BP.y() - BC.y() * BP.x();
    float cross3 = CA.x() * CP.y() - CA.y() * CP.x();

    //注：修改为float型变量后，由于浮点精度误差理论上不应该与0进行比较
    //同时未考虑等于0，即点位于边上的情况
    bool sign = (cross1 > 0 && cross2 > 0 && cross3 > 0) ||
                (cross1 < 0 && cross2 < 0 && cross3 < 0);

    return sign;
}
```

- rasterize_triangle()函数：

```cpp
void rst::rasterizer::rasterize_triangle(const Triangle& t) {
    auto v = t.toVector4();
    
    //find out the bounding box 计算包围盒
    float min_x = FLT_MAX;
    float max_x = FLT_MIN;
    float min_y = FLT_MAX;
    float max_y = FLT_MIN;

    for (const auto& point : v) {
        min_x = std::min(min_x, point.x());
        max_x = std::max(max_x, point.x());
        min_y = std::min(min_y, point.y());
        max_y = std::max(max_y, point.y());
    }

    //iterate through the pixel 遍历包围盒内像素
    for (int y = floor(min_y); y <= ceil(max_y); ++y) {
        for (int x = floor(min_x); x <= ceil(max_x); ++x) {
            // find if the current pixel is inside the triangle 判断像素是否位于三角形内部
            float pixel_x = x + 0.5f;
            float pixel_y = y + 0.5f;
            if (insideTriangle(pixel_x, pixel_y, t.v)) {
                //如果下一句中元组报错，请选择更新的C++标准（C++17及以上）
                auto [alpha, beta, gamma] = computeBarycentric2D(pixel_x, pixel_y, t.v);
                float w_reciprocal = 1.0 / (alpha / v[0].w() + beta / v[1].w() + gamma / v[2].w());
                float z_interpolated = alpha * v[0].z() / v[0].w() + beta * v[1].z() / v[1].w() + gamma * v[2].z() / v[2].w();
                z_interpolated *= w_reciprocal;

                int index = get_index(x, y);
                if (z_interpolated < depth_buf[index]) {
                    Vector3f point = Vector3f(x, y, z_interpolated);
                    set_pixel(point, t.getColor());
                    depth_buf[index] = z_interpolated;
                }
            }
        }
    }
}
```

### 提高任务：

- 用 super-sampling 处理 Anti-aliasing（即为SSAA），作业要求对每一个像素进行2×2的子像素采样，然后平均得到最后的结果。
- 实际上可以将无SSAA的情况统一到SSAA中，即为进行1×1的子像素采样，不过为了便于分开理解，本文不做统一。

- 修改光栅化器类（rasterizer.hpp）

```cpp
std::vector<Eigen::Vector3f> frame_buf_ssaa;
std::vector<float> depth_buf_ssaa;

//此处固定2倍的超采样系数，实际上可以设置set_ssaa_factor函数供main函数调用
int ssaa_factor = 2;

int get_ssaa_index(int x, int y);
void downsampling();
```

- 修改构造函数 rasterizer

```cpp
rst::rasterizer::rasterizer(int w, int h) : width(w), height(h)
{
    frame_buf.resize(w * h);
    depth_buf.resize(w * h);
    frame_buf_ssaa.resize(w * ssaa_factor * h * ssaa_factor);
    depth_buf_ssaa.resize(w * ssaa_factor * h * ssaa_factor);
}
```

- 修改清除函数 clear

```cpp
void rst::rasterizer::clear(rst::Buffers buff)
{
    if ((buff & rst::Buffers::Color) == rst::Buffers::Color)
    {
        std::fill(frame_buf.begin(), frame_buf.end(), Eigen::Vector3f{ 0, 0, 0 });
        std::fill(frame_buf_ssaa.begin(), frame_buf_ssaa.end(), Eigen::Vector3f{ 0, 0, 0 });
    }
    if ((buff & rst::Buffers::Depth) == rst::Buffers::Depth)
    {
        std::fill(depth_buf.begin(), depth_buf.end(), std::numeric_limits<float>::infinity());
        std::fill(depth_buf_ssaa.begin(), depth_buf_ssaa.end(), std::numeric_limits<float>::infinity());
    }
}
```

- 添加SSAA索引函数 get_ssaa_index

```cpp
int rst::rasterizer::get_ssaa_index(int x, int y) {
    return (height * ssaa_factor - 1 - y) * width * ssaa_factor + x;
}
```

- 修改光栅化三角形函数 rasterize_triangle

```cpp
void rst::rasterizer::rasterize_triangle(const Triangle& t) {
    //未使用SSAA时的代码，不做修改

    //supersample to anti-anliasing
    float ss_min_x = min_x * ssaa_factor;
    float ss_max_x = max_x * ssaa_factor;
    float ss_min_y = min_y * ssaa_factor;
    float ss_max_y = max_y * ssaa_factor;

    int ss_xmin = std::max(0, static_cast<int>(std::floor(ss_min_x)));
    int ss_xmax = std::min(width * ssaa_factor - 1, static_cast<int>(std::ceil(ss_max_x)));
    int ss_ymin = std::max(0, static_cast<int>(std::floor(ss_min_y)));
    int ss_ymax = std::min(height * ssaa_factor - 1, static_cast<int>(std::ceil(ss_max_y)));

    // 遍历超采样分辨率下的像素
    for (int y = ss_ymin; y <= ss_ymax; ++y) {
        for (int x = ss_xmin; x <= ss_xmax; ++x) {
            // 转换为原始坐标系的坐标 (0.5是样本点偏移量)
            float pixel_x = x / static_cast<float>(ssaa_factor) + 0.5f;
            float pixel_y = y / static_cast<float>(ssaa_factor) + 0.5f;

            // 检查当前超采样点是否在三角形内
            if (insideTriangle(pixel_x, pixel_y, t.v)) {
                auto [alpha, beta, gamma] = computeBarycentric2D(pixel_x, pixel_y, t.v);
                float w_reciprocal = 1.0 / (alpha / v[0].w() + beta / v[1].w() + gamma / v[2].w());
                float z_interpolated = alpha * v[0].z() / v[0].w() + beta * v[1].z() / v[1].w() + gamma * v[2].z() / v[2].w();
                z_interpolated *= w_reciprocal;

                int ss_index = get_ssaa_index(x, y);

                // 深度测试
                if (z_interpolated < depth_buf_ssaa[ss_index]) {
                    // 更新超采样缓冲区的颜色和深度
                    depth_buf_ssaa[ss_index] = z_interpolated;
                    frame_buf_ssaa[ss_index] = t.getColor();
                }
            }
        }
    }
}
```

- 添加下采样函数 downsampling

```cpp
void rst::rasterizer::downsampling() {
    if (ssaa_factor == 1) {
        // 不使用 SSAA，直接复制
        std::copy(frame_buf_ssaa.begin(), frame_buf_ssaa.end(), frame_buf.begin());
        return;
    }

    // 下采样过程
    for (int y = 0; y < height; ++y) {
        for (int x = 0; x < width; ++x) {
            Eigen::Vector3f avg_color(0, 0, 0);

            // 累加超采样像素
            for (int dy = 0; dy < ssaa_factor; ++dy) {
                for (int dx = 0; dx < ssaa_factor; ++dx) {
                    int ss_x = x * ssaa_factor + dx;
                    int ss_y = y * ssaa_factor + dy;

                    int ss_index = get_ssaa_index(ss_x, ss_y);
                    avg_color += frame_buf_ssaa[ss_index];
                }
            }

            // 计算平均值
            avg_color /= (ssaa_factor * ssaa_factor);

            // 设置到帧缓冲区
            int index = get_index(x, y);
            frame_buf[index] = avg_color;
        }
    }
}
```

- 修改绘制函数 draw

```text
void rst::rasterizer::draw(pos_buf_id pos_buffer, ind_buf_id ind_buffer, col_buf_id col_buffer, Primitive type)
{
    //原本代码，未修改
    for (auto& i : ind)
    {
       //原本代码，未修改

        downsampling();
    }
}
```
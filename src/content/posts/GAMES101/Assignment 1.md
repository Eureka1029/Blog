---
title: "GAMES101 作业1: 旋转与投影"
published: 2026-03-25
description: GAMES101 作业1
image: ""
tags:
  - GAMES101
category: GAMES101
draft: false
---
## 作业1：旋转与投影

本次作业的任务是填写一个旋转矩阵和一个透视投影矩阵。给定三维下三个点  , 你需要将这三个点的坐标变换为屏幕坐标，并在屏幕上绘制出对应的线框三角形 (在代码框架中，我们已经提供了 draw_triangle 函数，所以你只需要去构建变换矩阵即可)。简而言之，我们需要进行模型、视图、投影、视口等变换来将三角形显示在屏幕上。在提供的代码框架中，我们留下了模型变换和投影变换的部分给你去完成

### 主要任务：

- 补全 get_model_matrix(float rotation_angle) 模型矩阵函数和 get_projection_matrix(float eye_fov, float aspect_ratio, float zNear, float zFar) 投影矩阵函数
- 绕 Z 轴旋转的旋转矩阵 

```cpp
Eigen::Matrix4f get_model_matrix(float rotation_angle)
{
    Eigen::Matrix4f model = Eigen::Matrix4f::Identity();

    Eigen::Matrix4f rotation;
    //计算弧度制的角度
    float angle = rotation_angle / 180 * MY_PI;
    //构建绕Z轴旋转的矩阵（本题只要求该种旋转）
    rotation << cos(angle), -sin(angle), 0, 0,
                sin(angle),  cos(angle), 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1;

    model = rotation * model;

    return model;
}
```

- 透视投影矩阵（两种形式均可，结果相同）

```cpp
Eigen::Matrix4f get_projection_matrix(float eye_fov, float aspect_ratio,
                                      float zNear, float zFar)
{
    Eigen::Matrix4f projection = Eigen::Matrix4f::Identity();

    //该部分为第一类透视矩阵代码
    Eigen::Matrix4f perspective;
    float half_fov = eye_fov / 180 * MY_PI / 2;
    float cot_h_f = 1 / tan(half_fov);
    perspective << cot_h_f / aspect_ratio, 0, 0, 0,
                   0, cot_h_f, 0, 0,
                   0, 0, (zNear + zFar) / (zNear - zFar), 2 * zNear * zFar / (zNear - zFar),
                   0, 0, -1, 0;

    projection = perspective * projection;

    //该注释部分为第二类透视矩阵代码
    //Eigen::Matrix4f M_persp;
    //Eigen::Matrix4f M_ortho;
    //M_persp <<
    //    zNear, 0, 0, 0,
    //    0, zNear, 0, 0,
    //    0, 0, zNear + zFar, -zFar * zNear,
    //    0, 0, 1, 0;

    //float half_fov = 0.5 * eye_fov * MY_PI / 180.0f;
    //float yTop = -zNear * std::tan(half_fov);
    //float yBottom = -yTop;
    //float xRight = yTop * aspect_ratio;
    //float xLeft = -xRight;

    //M_ortho <<
    //    2 / (xRight - xLeft), 0, 0, -(xRight + xLeft)/(xRight - xLeft),
    //    0, 2 / (yTop - yBottom), 0, -(yTop + yBottom) / (yTop - yBottom),
    //    0, 0, 2 / (zNear - zFar),   -(zNear + zFar) / (zNear - zFar),
    //    0, 0, 0, 1;

    //projection = M_ortho * M_persp * projection;

    return projection;
}
```

### 提高任务：

- 实现 get_rotation(Vector3f axis, float angle) 的绕任意轴旋转一定角度的函数
- 罗德里格斯旋转公式（Rodrigues' rotation formula）：

```cpp
Eigen::Matrix4f get_rotation(Vector3f axis, float angle) {
    //归一化axis
    axis.normalize();
    //得到弧度制的角度
    angle = angle / 180 * MY_PI;
    Matrix3f I = Eigen::Matrix3f::Identity();
    Matrix3f N = Eigen::Matrix3f::Identity(); 
    //得到axis的反对称矩阵N
    N <<  0,        -axis.z(),  axis.y(),
          axis.z(),  0,        -axis.x(),
         -axis.y(),  axis.x(),  0;

    //应用罗格里德斯公式得到旋转矩阵
    Eigen::Matrix3f rodrigous = cos(angle) * I
        + (1 - cos(angle)) * axis * axis.transpose()
        + sin(angle) * N;

    //扩充为四维的齐次矩阵，并返回
    Eigen::Matrix4f rotation = Eigen::Matrix4f::Identity();
    rotation << rodrigous(0, 0), rodrigous(0, 1), rodrigous(0, 2), 0,
                rodrigous(1, 0), rodrigous(1, 1), rodrigous(1, 2), 0,
                rodrigous(2, 0), rodrigous(2, 1), rodrigous(2, 2), 0,
                0, 0, 0, 1;

    return rotation;
}
```

- 可以通过修改 main 函数中的模型矩阵，查看具体的运行结果

```cpp
//注释部分为原模型矩阵，axis为新定义的轴变量
//r.set_model(get_model_matrix(angle));
r.set_model(get_rotation(axis, angle));
```
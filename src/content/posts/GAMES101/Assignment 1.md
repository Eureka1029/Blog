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
>get_model_matrix(float rotation_angle): 逐个元素地构建模型变换矩 阵并返回该矩阵。在此函数中，你只需要实现三维中绕z轴旋转的变换矩阵， 而不用处理平移与缩放

```cpp
Eigen::Matrix4f get_model_matrix(float rotation_angle)
{
    Eigen::Matrix4f model = Eigen::Matrix4f::Identity();

    // TODO: Implement this function
    // Create the model matrix for rotating the triangle around the Z axis.
    // Then return it.
	float angle = rotation_angle / 180.0 * MY_PI;
    model(0, 0) = std::cos(angle);
	model(0, 1) = -std::sin(angle);
	model(1, 0) = std::sin(angle);
    model(1, 1) = std::cos(angle);
    return model;
}
```

>get_projection_matrix(float eye_fov, float aspect_ratio, float zNear, float zFar): 使用给定的参数逐个元素地构建透视投影矩阵并返回 该矩阵

```cpp
Eigen::Matrix4f get_projection_matrix(float eye_fov, float aspect_ratio,
                                      float zNear, float zFar)
{
    // Students will implement this function

    Eigen::Matrix4f projection = Eigen::Matrix4f::Identity();

    // TODO: Implement this function
    // Create the projection matrix for the given parameters.
    // Then return it.
    Eigen::Matrix4f prespToortho = Eigen::Matrix4f::Identity();
    Eigen::Matrix4f ortho = Eigen::Matrix4f::Identity();
    Eigen::Matrix4f translate = Eigen::Matrix4f::Identity();
    Eigen::Matrix4f scale = Eigen::Matrix4f::Identity();

	float t = std::tan(eye_fov / 180.0 * MY_PI / 2) * zNear;
    float b = -t;
    float r = t * aspect_ratio;
	float l = -r;

	translate(0, 3) = -(r + l) / 2;
    translate(1, 3) = -(t + b) / 2;
    translate(2, 3) = -(zNear + zFar) / 2;

	scale(0, 0) = 2 / (r - l);
	scale(1, 1) = 2 / (t - b);
	scale(2, 2) = 2 / (zNear - zFar);

	ortho = scale * translate;

	prespToortho(0, 0) = zNear;
    prespToortho(1, 1) = zNear;
	prespToortho(2, 2) = zNear + zFar;
	prespToortho(2, 3) = -zNear * zFar;
    prespToortho(3, 2) = 1;
    prespToortho(3, 3) = 0;


	projection = ortho * prespToortho;

    return projection;
}
```


> 在 main.cpp 中构造一个函数，该函数的作用是得到绕任意 过原点的轴的旋转变换矩阵。 Eigen::Matrix4f get_rotation(Vector3f axis, float angle)

```cpp
Eigen::Matrix4f get_rotation(Eigen::Vector3f axis, float angle) {
    // 最终要返回的 4x4 齐次矩阵，先初始化为单位矩阵
    Eigen::Matrix4f rotation = Eigen::Matrix4f::Identity();

    // 1. 角度转弧度 (假设输入的 angle 是角度)
    // 注意：如果你的环境中没有 MY_PI，可以使用 std::acos(-1.0f) 代替
    float rad = angle / 180.0f * MY_PI;

    // 2. 将旋转轴标准化为单位向量 (非常重要！公式的前提是单位向量)
    Eigen::Vector3f n = axis.normalized();

    // 3. 构建 3x3 单位矩阵 I
    Eigen::Matrix3f I = Eigen::Matrix3f::Identity();

    // 4. 构建叉积矩阵 (反对称矩阵) N
    Eigen::Matrix3f N;
    N << 0, -n.z(), n.y(),
        n.z(), 0, -n.x(),
        -n.y(), n.x(), 0;

    // 5. 应用罗德里格斯公式计算 3x3 旋转矩阵 R
    // n * n.transpose() 就是向量的外积 n * n^T
    Eigen::Matrix3f R = std::cos(rad) * I +
        (1.0f - std::cos(rad)) * n * n.transpose() +
        std::sin(rad) * N;

    // 6. 将 3x3 的旋转矩阵填入 4x4 矩阵的左上角
    // Eigen 提供了便捷的方法 topLeftCorner 或者 block
    rotation.topLeftCorner<3, 3>() = R;

    return rotation;
}
```
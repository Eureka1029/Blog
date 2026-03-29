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



```cpp
static bool insideTriangle(int x, int y, const Vector3f* _v)
{   
    bool pre;
    for (int i = 0; i < 3; i++)
    {
        Vector3f v1 = _v[i] - _v[(i + 1) % 3];
        Vector3f v2 = Vector3f(x, y, 0) - _v[i];

		Vector3f cross = v1.cross(v2);
        if (i == 0)
        {
            pre = cross.z() > 0;
        }
        else if (pre != (cross.z() > 0))
        {
            return false;
        }

   
    }
    return true;
   
    // TODO : Implement this function to check if the point (x, y) is inside the triangle represented by _v[0], _v[1], _v[2]
}


//Screen space rasterization
void rst::rasterizer::rasterize_triangle(const Triangle& t) {
    auto v = t.toVector4();
    
    int min_x = INT_MAX;
    int max_x = 0;
    int min_y = INT_MAX;
    int max_y = 0;
	for (auto& vert : v)
    {
        min_x = std::min(min_x, (int)std::floor(vert.x()));
        max_x = std::max(max_x, (int)std::ceil(vert.x()));
        min_y = std::min(min_y, (int)std::floor(vert.y()));
        max_y = std::max(max_y, (int)std::ceil(vert.y()));
    }


    for (int x = min_x; x <= max_x; x++) {
        for (int y = min_y; y <= max_y; y++) {
			int center_x = x + 0.5;
			int center_y = y + 0.5;

            if (insideTriangle(center_x, center_y, t.v)) {
                auto[alpha, beta, gamma] = computeBarycentric2D(x, y, t.v);
                float w_reciprocal = 1.0/(alpha / v[0].w() + beta / v[1].w() + gamma / v[2].w());
                float z_interpolated = alpha * v[0].z() / v[0].w() + beta * v[1].z() / v[1].w() + gamma * v[2].z() / v[2].w();
                z_interpolated *= w_reciprocal;

				int index = get_index(x, y);
				if (z_interpolated < depth_buf[index]) {
                    depth_buf[index] = z_interpolated;
                    set_pixel(Eigen::Vector3f(x, y, 1), t.getColor());
                }
            }
        }
    }


    // TODO : Find out the bounding box of current triangle.
    // iterate through the pixel and find if the current pixel is inside the triangle

    // If so, use the following code to get the interpolated z value.
    //auto[alpha, beta, gamma] = computeBarycentric2D(x, y, t.v);
    //float w_reciprocal = 1.0/(alpha / v[0].w() + beta / v[1].w() + gamma / v[2].w());
    //float z_interpolated = alpha * v[0].z() / v[0].w() + beta * v[1].z() / v[1].w() + gamma * v[2].z() / v[2].w();
    //z_interpolated *= w_reciprocal;

    // TODO : set the current pixel (use the set_pixel function) to the color of the triangle (use getColor function) if it should be painted.



}
```
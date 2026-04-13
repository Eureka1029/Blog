---
title: 03 Barycentric coordinates 质心坐标
published: 2026-04-13
description: Lesson 3
image: ""
tags:
  - 图形学
  - tinyrenderer
category: tinyrenderer
draft: false
---

鞋带公式计算面积:
$$\text{Area}(ABC) = \frac{1}{2} \left( \small(B_y-A_y)(B_x+A_x) + (C_y-B_y)(C_x+B_x) + (A_y-C_y)(A_x+C_x) \right).$$

重心坐标
$$P = \alpha A + \beta B + \gamma C,$$

$$\alpha = \frac{ \, \text{Area}(PBC) \, }{ \, \text{Area}(ABC) \, }.$$
$$\beta = \frac{ \, \text{Area}(PCA) \, }{ \, \text{Area}(ABC) \, }, \quad \gamma = \frac{ \, \text{Area}(PAB) \, }{ \, \text{Area}(ABC) \, }.$$



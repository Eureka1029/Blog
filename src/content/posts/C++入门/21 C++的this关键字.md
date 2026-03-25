---
title: "C++入门 (二十一) : this关键字"
published: 2026-03-28
description: 关于this关键字
image: ""
tags:
  - CPP
category: C++
draft: false
---
C++中有这样一个关键字this，通过它可以访问成员函数。 this是一个指向当前对象实例的指针，该method(方法)属于这个对象实例。

```cpp
class Entity
{
public:
    int x, y;

    Entity(int x,int y)
    // : x(x),y(y)
    {
        x = x;
    }
};
```

> 如果不用成员列表初始化(如注释一样),我想在方法内部写,由于传入参数的x和成员x名字一样,x=x只会让传入的x赋值给它自己，也就是什么都不做.

而我真正想做的是引用属于这个类的x和y，`this`关键字可以让我们做到这一点。

```cpp
class Entity
{
public:
    int x, y;

    Entity(int x,int y)
    // : x(x),y(y)
    {
        this->x = x; // 这里this的类型是 Entity* const 即不允许改变指向的对象
        //等价于
        //Entity* e = this;
        //e->x = x;
        
    }
};
```


this的使用场景
```cpp
#include <iostream>

class Entity;
void PrintEntity(Entity* e);

class Entity
{
public:
    int x, y;

    Entity(int x,int y)
    {
        this->x = x;
        this->y = y;
        PrintEntity(this);
    }

    int GetX() const
    {
        // this->x = 5;
        const Entity* e = this;
        return this->x;
    }
};


void PrintEntity(Entity* e)
{
    // Print
}
```
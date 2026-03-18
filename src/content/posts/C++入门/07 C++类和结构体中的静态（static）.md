---
title: "C++入门 : C++类和结构体中的静态（static）07"
published: 2026-03-17
description: 关于static你需要知道的事...
image: ""
tags:
  - CPP
category: C++
draft: false
---
## static变量

如果你在类中创建了一个 static 变量，则这个类的所有实例中，这个变量只有一个实例。 同样，如果一个实例修改了这个变量，则这个改变会体现在所有的类实例中。 就像时这个类的global实例

```cpp

struct Entity  // 用struct是想默认public
{
    int x, y;

    void Print()
    {
        std::cout << x << "," << y << std::endl;
    }
};

int main()
{
    Entity e;
    e.x = 2;
    e.y = 3;

    Entity e1 = { 5,8 };  // Initializer

    e.Print();   // 2, 3
    e1.Print();  // 5, 8
    std::cin.get();
}

```


**例子**

> 静态成员变量在编译时存储在静态存储区，即定义过程应该在编译时完成，因此一定要在类外进行定义，但可以不初始化。
> 一个类的普通变量的内存空间是在创建对象时分配的,static变量的内存空间不会在创建对象时分配的,而是在编译时确定的,因此必须要在类外定义,否则链接器不知道该定义在哪.

```cpp
struct Entity  // 用struct是想默认public
{
    static int x, y;

    void Print()
    {
        std::cout << x << "," << y << std::endl;
    }
};

int Entity::x;
int Entity::y;

int main()
{
    Entity e;
    e.x = 2;  // Entity::x;
    e.y = 3;  // Entity::y;
    e.Print();

    Entity e1;
    Entity::x = 5;
    Entity::y = 8;

    e1.Print();
    std::cin.get();
}

```

> 静态成员变量是所有实例共享的，但是其只是在类中进行了声明，并未定义或初始化（分配内存），类或者类实例就无法访问静态成员变量，这显然是不对的，所以必须先在类外部定义，也就是分配内存

## static方法

static方法无法访问非static成员变量.(原因是static方法没有类实例)

> 类的普通方法是这样定义的
```cpp
struct Entity  // 用struct是想默认public
{
    int x, y;

    void Print()
    {
        std::cout << x << "," << y << std::endl;
    }
};
```

> 类的普通方法等价于
```cpp
struct Entity  // 用struct是想默认public
{
    int x, y;
};
static void Print(Entity e)
{
	std::cout << e.x << "," << e.y << std::endl;
}
```


> 而static方法相当于在类外定义的方法,不会获得类实例
```cpp
struct Entity  // 用struct是想默认public
{
    int x, y;

};
static void Print()
{
	std::cout <<x << "," << y << std::endl; //他们根本不知道x和y是什么
}

```
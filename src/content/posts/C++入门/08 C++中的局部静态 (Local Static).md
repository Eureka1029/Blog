---
title: "C++入门 : C++中的局部静态 (Local Static) 08"
published: 2026-03-15
description: 关于C++中的局部静态...
image: ""
tags:
  - CPP
category: C++
draft: false
---
**生命周期**的意思是变量实际的存在时间，也就是变量在被删除之前在内存中停留多久 作用域就是我们可以访问这个变量的范围

局部静态的作用就是生成一个生命周期跟程序一样,但作用域仅限于该代码块中的变量

```cpp
void Func(){
	static int i = 0;
	i++;
	std::cout << i < std::endl;
}
int main(){
	Func();
	Func();
	Func();
	Func();
	Func(); // 结果是 1 2 3 4 5
}
```

> 等价于: 但是上例的int只在函数里能使用,而下例的i是全局的变量
```cpp
int i = 0;
void Func(){
	i++;
	std::cout << i < std::endl;
}
int main(){
	Func();
	Func();
	Func();
	Func();
	Func(); // 结果是 1 2 3 4 5
}
```

## 单例类

只存在一个实例对象的类;

> 常规方法实现

```cpp
#include<iostream>
class Singleton {
private:
	static Singleton* s_instance; // 设置为static是为了只有一个实例
public:
	static Singleton& Get(){
		return *s_instance;
	}
	void printHello(){
		std::cout << "print Hello" << std::endl;
	}
};
Singleton* Singleton::s_instance = nullptr;

int main(){
	Singleton::Get().printHello();
	return 0;
}
```

> 有了局部static我们可以这样实现

```cpp
#include<iostream>
class Singleton {
public:
	static Singleton& Get(){
		static Singleton s_instance; //会被定义在堆上
		return s_instance; 
	}
	void printHello(){
		std::cout << "print Hello" << std::endl;
	}
};

int main(){
	Singleton::Get().printHello();
	return 0;
}
```
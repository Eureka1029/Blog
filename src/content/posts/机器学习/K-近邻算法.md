---
title: "机器学习 (三) : K-近邻算法"
published: 2026-04-01
description: 关于K-近邻算法
image: ""
tags:
  - 机器学习
category: 机器学习
draft: false
---

## K值大小的影响
![](../../../images/Pasted%20image%2020260401113318.png)


**近似误差Approximation Error** 和 **估计误差Estimation Error**是两个被严格区分的概念。它们通常对应着我们常说的**偏差Bias**和**方差Variance**。

- **近似误差 (Approximation Error)：** * **通俗理解：** 模型在**训练集**上的表现好坏。它衡量的是模型对现有训练数据的拟合程度。
    - **对应概念：** 偏差（Bias）。
    - **当误差减小时：** 说明模型把训练数据学得非常透彻，连训练集里的细节都掌握了。
        
- **估计误差 (Estimation Error)：** * **通俗理解：** 模型在**测试集**（未知的新数据）上的表现好坏。它衡量的是模型的泛化能力。
    - **对应概念：** 方差（Variance）。
    - **当误差增大时：** 说明模型太敏感了，训练集稍微变一点，或者遇到没见过的新数据，预测结果就会大幅波动。



## 算法实现
> 手写版
```python
import numpy as np

def createDataSet():
    group = np.array([[90,100], [88,90], [85,95], [10,20], [30,40], [50,30]]) 
    labels = ['A', 'A', 'A', 'D', 'D', 'D']
    return group, labels

def KNNclassify(newInput, dataSet, labels, k):
    # 1. 计算欧氏距离
    numSamples = dataSet.shape[0] 
    diff = np.tile(newInput, (numSamples, 1)) - dataSet
    squardDiff = diff ** 2       # 修正：加上 Python 的乘方符号 **
    squardDiff = np.sum(squardDiff, axis = 1) 
    distance = squardDiff ** 0.5 # 修正：加上乘方符号，0.5次方等同于开根号

    # 2. 对距离进行排序
    sortedDistIndices = np.argsort(distance)

    # 3. 统计前 k 个最近邻的标签
    classCount = {}  
    for i in range(k):
        voteLabel = labels[sortedDistIndices[i]]
        classCount[voteLabel] = classCount.get(voteLabel, 0) + 1

    # 4. 返回得到投票数最多的分类
    maxCount = 0
    maxIndex = '' # 初始化一个变量存最终结果
    for key, value in classCount.items():
        if value > maxCount:
            maxCount = value
            maxIndex = key
            
    return maxIndex

# 5. 测试代码
dataSet, labels = createDataSet()

textX1 = np.array([15,20])
outputLabel1 = KNNclassify(textX1, dataSet, labels, 3)
print('your input is:', textX1, 'and the classified to class is:', outputLabel1)

textX2 = np.array([80,70])
outputLabel2 = KNNclassify(textX2, dataSet, labels, 3)
print('your input2 is:', textX2, 'and the classified2 to class is:', outputLabel2)
```

### 核心逻辑拆解

KNN 算法的核心思想非常简单：**“近朱者赤，近墨者黑”**。

当你给它一个新数据点时，它会：

1. 算出这个新点和数据库里所有已知点之间的**距离**。
    
2. 找出距离最近的 **K** 个点（这就是 K 的由来）。
    
3. 看看这 K 个点多数属于哪个类别，新点就属于哪个类别（**少数服从多数**的投票机制）。
    

现在，我们逐块拆解代码是如何实现这三步的：

#### 1. 准备数据 (`createDataSet`)


```Python
group = np.array([[90,100], [88,90], [85,95], [10,20], [30,40], [50,30]]) 
labels = ['A', 'A', 'A', 'D', 'D', 'D']
```

这里你创建了 6 个样本点，每个点有 2 个特征（比如可以想象成 `[数学成绩, 英语成绩]`）。前三个点数值很高，标签是 `'A'`；后三个点数值较低，标签是 `'D'`。

#### 2. 计算距离（代码中最精妙的向量化操作）

计算两点之间的直线距离，我们使用**欧氏距离**公式：

$d = \sqrt{(x_1 - x_2)^2 + (y_1 - y_2)^2}$

为了让计算速度飞快，代码没有用 `for` 循环一个个算，而是利用了 NumPy 的**矩阵运算（广播机制）**：



```python
numSamples = dataSet.shape[0] # 获取样本数量，这里是 6
# np.tile 把新输入的点 newInput 复制扩展成了 6 行。
# 这样就可以直接让 "6个新点" 减去 "6个已知点"
diff = np.tile(newInput, (numSamples, 1)) - dataSet 
```

如果 `newInput` 是 `[15, 20]`，`np.tile` 后它变成了：

```Plaintext
[[15, 20],
 [15, 20],
 ...6行]
```

然后直接和 `dataSet` 矩阵相减，得到每个特征的差值 $(x_1 - x_2)$ 和 $(y_1 - y_2)$。


```Python
squardDiff = diff ** 2  # 把差值平方
squardDiff = np.sum(squardDiff, axis = 1) # 把每一行的两个平方值加起来
distance = squardDiff ** 0.5 # 最后整体开根号，得到真实的距离数组
```

#### 3. 排序找邻居 (`argsort`)

```Python
sortedDistIndices = np.argsort(distance)
```

这是 NumPy 中极其常用的一个函数。它**不返回排序后的距离本身，而是返回排好序的索引（下标）**。

- 假设 `distance` 是 `[100, 10, 50]`。
- 最短的距离是 10，它的索引是 `1`。
- 次短的是 50，索引是 `2`。
- 最长的是 100，索引是 `0`。
- 所以 `argsort` 返回的结果是：`[1, 2, 0]`。
    我们拿到这个索引数组后，提取前 K 个元素，就等于找到了最近的 K 个邻居！
    

#### 4. 投票机制

```Python
classCount = {}  
for i in range(k):
    voteLabel = labels[sortedDistIndices[i]] # 通过索引找到邻居的标签
    classCount[voteLabel] = classCount.get(voteLabel, 0) + 1 # 字典计数
```

这里巧妙地使用了字典的 `.get(key, default_value)` 方法。如果 `voteLabel`（比如 'A'）还没在字典里出现过，就默认给它 0 个票，然后加 1；如果出现过了，就在原有票数上加 1。最终你会得到类似 `{'A': 1, 'D': 2}` 这样的字典。

#### 5. 选出票数最多的赢家

```python
maxCount = 0
for key, value in classCount.items():
    if value > maxCount:
        maxCount = value
        maxIndex = key
return maxIndex
```

这段代码遍历字典，通过打擂台的方式（只要比当前 `maxCount` 大，就替换成新的冠军），找出得票数最多的标签 `maxIndex`。



> 导入库
```python
from sklearn.neighbors import KNeighborsClassifier

X = [[0],[1],[2],[3]]
y = [0,0,1,1]

neigh = KNeighborsClassifier(n_neighbors=3)
neigh.fit(X,y)
print(neigh.predict([[1.1]]))

```
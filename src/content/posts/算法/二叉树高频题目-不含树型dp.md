---
title: "算法通关 (三) : 二叉树高频题目-不含树型dp"
published: 2026-03-18
description: 关于二叉树..
image: ""
tags:
  - 算法
  - 二叉树
category: 算法
draft: true
---
##  二叉树的层序遍历
https://leetcode.cn/problems/binary-tree-level-order-traversal/

ans:列表的数组,用于返回答案
queue:记录节点
map:记录节点和层次的对应关系

> 使用哈希表+队列实现;基本逻辑就是:从队列弹出一个元素,看看他在哪一层,如果层数大于列表的数组个数,说明遍历到了新的一层,然后看看左边空不空,看看右边空不空,不空就把节点加入到队列中,并在哈希表记录节点和层数的对应关系.

```cpp
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> ans;
        if(root != nullptr){
            queue<TreeNode*> q;
            unordered_map<TreeNode*, int> mp;
            q.push(root);
            mp[root] = 0;
            while(!q.empty()){
                TreeNode* node = q.front();
                q.pop();
                int level = mp[node];
                if(ans.size() == level){
                    ans.push_back({});
                }
                ans[level].push_back(node->val);
                if(node->left!=nullptr){
                    mp[node->left] = level + 1;
                    q.push(node->left);
                }
                if(node->right!=nullptr){
                    mp[node->right] = level + 1;
                    q.push(node->right);
                }

            }
        }
        return ans;
    }
};
```

### 优化版

可以一次处理一层:
1. 求出队列size
2. 循环size次
	1. 弹出一个节点
	2. 有左压左,有右压右
3. 回到第一步

```cpp
class Solution {
public:
    vector<vector<int>> levelOrder(TreeNode* root) {
        vector<vector<int>> ans;
        if(root != nullptr){
            queue<TreeNode*> q;
            q.push(root);
            while(!q.empty()){
                vector<int> vec;
                int size = q.size();
                //一次处理一层
                for(int i = 0; i < size; i++){
                    TreeNode* node = q.front();
                    q.pop();
                    vec.push_back(node->val);
                    
                    //左不空
                    if(node->left!=nullptr){
                        q.push(node->left);
                    }
                    
                    //右不空
                    if(node->right!=nullptr){
                        q.push(node->right);
                    }
                }
                ans.push_back(vec);
            }
        }
        return ans;
    }
};
```


---

## 二叉树的锯齿形层序遍历
https://leetcode.cn/problems/binary-tree-zigzag-level-order-traversal/

在层序的遍历的逻辑上
如果从左往右输出:从l走到r-1
如果从右往左输出,从r-1走到l

```cpp
class Solution {
public:
    int l, r;
    TreeNode* que[2001];
    vector<vector<int>> zigzagLevelOrder(TreeNode* root) {
        vector<vector<int>> ans;
        if(root != nullptr){
            l = r = 0;
            que[r++] = root;
            bool reverse = false; //false从左向右 
            // true从右向左
            while(l < r){
                int size = r - l;
                vector<int> vec;
                for(int i = reverse ? r - 1 : l, j = reverse ? -1 : 1, k = 0; k < size; i+=j, k++){ // 把队列里的元素加入这一层的数组里
                    TreeNode* cur = que[i];
                    vec.push_back(cur->val);
                }
                
                //看下一层的元素
                for(int i = 0; i < size; i++){
                    TreeNode* cur = que[l++];
                    if(cur->left!=nullptr){
                        que[r++] = cur->left;
                    }
                    if(cur->right!=nullptr){
                        que[r++] = cur->right;
                    }
                }
                ans.push_back(vec);
                reverse = !reverse;
            }

        }
        return ans;
    }
};
```

---

## 二叉树最大宽度
https://leetcode.cn/problems/maximum-width-of-binary-tree/
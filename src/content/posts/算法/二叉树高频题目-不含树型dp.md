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

> 本题使用两个队列,一个记录节点,一个记录节点的编号,依旧是层序遍历,只需要在压入节点的时候也将编号压入即可.

```cpp
using ULL = unsigned long long;
class Solution {
public:
    TreeNode* nq[3001];
    ULL iq[3001];
    int l, r;
    int widthOfBinaryTree(TreeNode* root) {
        int ans = 1;
        l = r = 0;
        nq[r] = root;
        iq[r++] = 1;
        while(l < r){
            int size = r - l;
            //当前层情况
            // 左...........右
            // l...........r-1
            // 最右的编号 - 最左的编号 + 1就是宽度
            ans = max(ans, (int)(iq[r - 1] - iq[l] + 1));
            for(int i = 0; i < size; i++){
                TreeNode* cur = nq[l];
                ULL id = iq[l];
                l++;
                if(cur->left!=nullptr){
                    nq[r] = cur->left;
                    iq[r++] = id*2;
                }
                if(cur->right!=nullptr){
                    nq[r] = cur->right;
                    iq[r++] = id*2 + 1;
                }
            }

        }
        return ans;
    }
};
```


---

## 二叉树最大深度
https://leetcode.cn/problems/maximum-depth-of-binary-tree/

> 递归实现
```cpp
class Solution {
public:
    int maxDepth(TreeNode* root) {
        return root == nullptr ? 0 : max(maxDepth(root->left),maxDepth(root->right)) + 1;
    }
};
```

## 二叉树最小深度
https://leetcode.cn/problems/minimum-depth-of-binary-tree/description/
> 递归实现
```cpp
class Solution {
public:
    int minDepth(TreeNode* root) {
        if(root == nullptr){
            return 0;
        }
        if(root->left == nullptr && root->right == nullptr){
            return 1;
        }
        int ldeep = INT_MAX;
        int rdeep = INT_MAX;
        if(root->left != nullptr){
            ldeep = minDepth(root->left);
        }
        if(root->right != nullptr){
            rdeep = minDepth(root->right);
        }
        return min(ldeep,rdeep) + 1;
    }
};
```

--- 

## 二叉树的先序遍历序列化与反序列化
https://leetcode.cn/problems/serialize-and-deserialize-binary-tree/

>使用先序递归

```cpp
class Codec {
public:
    // 序列化
    string serialize(TreeNode* root) {
        string builder;
        f(root, builder);
        return builder;
    }

    // 反序列化
    TreeNode* deserialize(string data) {
        vector<string> vals = split(data, ',');
        cnt = 0;
        return g(vals);
    }

private:
    int cnt; // 当前数组消费到哪了

    // 辅助函数：递归序列化
    void f(TreeNode* root, string& builder) {
        if (root == nullptr) {
            builder += "#,";
        } else {
            builder += to_string(root->val) + ",";
            f(root->left, builder);
            f(root->right, builder);
        }
    }

    // 辅助函数：递归反序列化
    TreeNode* g(const vector<string>& vals) {
        string cur = vals[cnt++];
        if (cur == "#") {
            return nullptr;
        } else {
            TreeNode* head = new TreeNode(stoi(cur));
            head->left = g(vals);
            head->right = g(vals);
            return head;
        }
    }

    // 工具函数：分割字符串
    vector<string> split(const string& s, char delim) {
        vector<string> result;
        string item;
        stringstream ss(s);
        while (getline(ss, item, delim)) {
            result.push_back(item);
        }
        return result;
    }
};
```


---

二叉树的层序遍历序列化与反序列化
https://leetcode.cn/problems/serialize-and-deserialize-binary-tree/

> 无论是序列化还是反序列化,层序遍历都应该先处理根节点,序列化就是把根放进队列后,弹出一个元素,处理左右.反序列化就是先造好根节点,压入队列,弹出一个元素,根据字符串内容生成左右,处理左右


```cpp
class Codec {
public:
    queue<TreeNode*> q;

    // Encodes a tree to a single string.
    string serialize(TreeNode* root) {
        string builder;
        if(root != nullptr){
            builder += to_string(root->val) + ",";
            q.push(root);
            while(!q.empty()){
                TreeNode* cur = q.front();
                q.pop();
                if(cur->left!=nullptr){
                    q.push(cur->left);
                    builder += to_string(cur->left->val) + ",";
                }else{
                    builder += "#,";
                }
                if(cur->right!=nullptr){
                    q.push(cur->right);
                    builder += to_string(cur->right->val) + ",";
                }else{
                    builder += "#,";
                }
            }
        }
        return builder;
    }

    // Decodes your encoded data to tree.
    TreeNode* deserialize(string data) {
        if(data.empty()){
            return nullptr;
        }
        vector<string> nodes = split(data,',');
        int index = 0;
        TreeNode* root = generate(nodes[index++]);
        q.push(root);
        while(!q.empty()){
            TreeNode* cur = q.front();
            q.pop();
            cur->left = generate(nodes[index++]);
            cur->right = generate(nodes[index++]);
            if(cur->left != nullptr){
                q.push(cur->left);
            }
            if(cur->right != nullptr){
                q.push(cur->right);
            }
        }
        return root;

    }

    TreeNode* generate(const string& node){
        return node == "#" ? nullptr : new TreeNode(stoi(node));
    }

    vector<string> split(const string& s, char delim){
        stringstream ss(s);
        string item;
        vector<string> result;
        while(getline(ss, item, delim)){
            result.push_back(item);
        }
        return result;
    }
};
```


--- 



---
title: "算法通关 (三) : 二叉树高频题目-不含树型dp"
published: 2026-03-18
description: 关于二叉树..
image: ""
tags:
  - 算法
  - 二叉树
category: 算法
draft: false
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

##  从前序与中序遍历序列构造二叉树
https://leetcode.cn/problems/construct-binary-tree-from-preorder-and-inorder-traversal/

> 使用递归实现

```cpp
class Solution {
public:
    TreeNode* buildTree(vector<int>& preorder, vector<int>& inorder) {
        if(preorder.empty() || inorder.empty() || inorder.size() != preorder.size()){
            return nullptr;
        }
        unordered_map<int, int> mp;
        for(int i = 0; i < inorder.size(); i++){
            mp[inorder[i]] = i;
        }
        return f(preorder, 0, preorder.size() - 1, inorder, 0, inorder.size()-1, mp);
    }

    TreeNode* f(vector<int>& preorder, int l1, int r1, vector<int>& inorder, int l2, int r2, unordered_map<int,int>& mp){
        if(l1 > r1){
            return nullptr;
        }
        TreeNode* head = new TreeNode(preorder[l1]);
        if(l1 == r1){
            return head;
        }

        int k = mp[preorder[l1]];
        head->left = f(preorder, l1 + 1, l1 + k - l2, inorder, l2, k-1, mp);
        head->right = f(preorder, l1 + k - l2 + 1, r1, inorder, k + 1, r2, mp);
        return head;
    }
};
```

--- 
##  二叉树的完全性检验
https://leetcode.cn/problems/check-completeness-of-a-binary-tree

> 在层序遍历的基础上加上对叶子节点的判断


```cpp
class Solution {
public:
    bool isCompleteTree(TreeNode* root) {
        if(root == nullptr){
            return true;
        }
        //是否遇到左右不双全的节点
        bool leaf = false;
        queue<TreeNode*> q;
        q.push(root);
        while(!q.empty()){
            TreeNode* cur = q.front();
            q.pop();
            if((cur->left == nullptr && cur->right != nullptr) || (leaf && (cur->left != nullptr || cur->right != nullptr))){
                return false;
            }
            if(cur->left != nullptr){
                q.push(cur->left);
            }
            if(cur->right != nullptr){
                q.push(cur->right);
            }
            if(cur->left == nullptr || cur->right == nullptr){
                leaf = true;
            }
        }
        return true;
    }
};
```


---

## 完全二叉树的节点个数
https://leetcode.cn/problems/count-complete-tree-nodes/

*要求时间复杂度低于O(n)*

> 利用完全二叉树的个数计算公式和递归实现

```cpp
class Solution {
public:
    int countNodes(TreeNode* root) {
        if(root == nullptr){
            return 0;
        }
        return f(root, 1, mostLeft(root, 1));
    }
    //level代表当前所在层
    //h代表总高
    int f(TreeNode* cur, int level, int h){
        if(level == h){
            return 1;
        }
        if(mostLeft(cur->right, level + 1) == h){
            // cur右树上的最左节点，扎到了最深层
            return (1 << (h - level)) + f(cur->right, level + 1, h);
        }else{
            // cur右树上的最左节点，没扎到最深层
            return (1 << (h - level - 1)) + f(cur->left, level + 1, h);
        }
    }
    //看一颗子树最多能到多少层
    int mostLeft(TreeNode* cur,int level){
        while(cur != nullptr){
            level++;
            cur = cur->left;
        }
        return level - 1;
    }
};
```


---


##  二叉树的最近公共祖先
https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-tree/

> 使用递归实现

```cpp
class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        if(root == nullptr || p == root || q == root){
            return root;
        }
        //在左树上找
        TreeNode* l = lowestCommonAncestor(root->left, p, q);
        //在右树上找
        TreeNode* r = lowestCommonAncestor(root->right, p, q);
        
        if(l == nullptr && r == nullptr){
	        //左右都没找到,返回空
            return nullptr;
        }
        if(l != nullptr && r != nullptr){
	        //左右都找到了,root节点就是公共节点
            return root;
        }
        // 只找到一边,返回找到的那一边
        return l == nullptr ? r : l;
    }
};
```

---

##  二叉搜索树的最近公共祖先
https://leetcode.cn/problems/lowest-common-ancestor-of-a-binary-search-tree/

```cpp
class Solution {
public:
    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {
        // root从上到下
		// 如果先遇到了p，说明p是答案
		// 如果先遇到了q，说明q是答案
		// 如果root在p~q的值之间，不用管p和q谁大谁小，只要root在中间，那么此时的root就是答案
		// 如果root在p~q的值的左侧，那么root往右移动
		// 如果root在p~q的值的右侧，那么root往左移动
        while(root->val != p->val && root->val != q->val){
            if(root->val < max(p->val,q->val) && root->val > min(p->val,q->val)){
                break;
            }
            root = root->val < min(p->val,q->val) ? root->right : root->left;
        }
        return root;
    }
};
```

---

##  路径总和 II
https://leetcode.cn/problems/path-sum-ii/)

> 在递归的同时需要维护公共变量

```cpp
class Solution {
public:
    vector<vector<int>> pathSum(TreeNode* root, int targetSum) {
        vector<vector<int>> ans;
        if(root != nullptr){
            vector<int> path;
            f(root, targetSum, 0, ans, path);
        }
        return ans;
    }
    void f(TreeNode* cur, int aim, int sum, vector<vector<int>>& ans, vector<int>& path){
        if(cur->left == nullptr && cur->right == nullptr){
            if(cur->val + sum == aim){
                path.push_back(cur->val);
                ans.push_back(path);
                path.pop_back();
            }
        }else{
            path.push_back(cur->val);
            if(cur->left != nullptr){
                f(cur->left, aim, sum + cur->val, ans, path);
            }
            if(cur->right != nullptr){
                f(cur->right, aim, sum + cur->val, ans, path);
            }   
            path.pop_back();
        }
    }
};
```

---
##  平衡二叉树
https://leetcode.cn/problems/balanced-binary-tree/

> 在递归求高度的同时进行判断是否平衡

```cpp
class Solution {
public:
    bool balance;
    bool isBalanced(TreeNode* root) {
        balance = true;
        f(root);
        return balance;
    }
    int f(TreeNode* root){
        if(!balance || root == nullptr){
            return 0;
        }
        int lh = f(root->left);
        int rh = f(root->right);
        if(abs(lh-rh) > 1){
            balance = false;
        }
        return max(lh,rh) + 1;
    }
};
```

---

## 验证二叉搜索树
https://leetcode.cn/problems/validate-binary-search-tree/description/

> 法1:利用非递归中序遍历(使用栈实现),搜索树中序遍历之后应该是升序

```CPP
class Solution {
public:
    bool isValidBST(TreeNode* root) {
        if(root == nullptr){
            return true;
        }
        stack<TreeNode*> st;
        TreeNode* pre = nullptr;
        while(!st.empty() || root != nullptr){
            if(root != nullptr){
                st.push(root);
                root = root->left;
            }else{
                root = st.top();
                st.pop();
                if(pre != nullptr && pre->val >= root->val){
                    return false;
                }
                pre = root;
                root = root->right;
                
            }
        }
        return true;
    }
};
```

> 法2:递归

递归方法是考虑左子树的最大值和右子树的最小值,如果当前节点处于两者之间,说明当前节点不违规.

遇到空节点,我们把min和max分别设置为非常大和非常小.返回到非空节点的时候记录下来.需要记录四个值:左树最大值,左树最小值,右树最大值,右树最小值.

子树向上返回的时候需要更新全局变量,这样来向父节点传递子树的最大值和最小值.

```CPP
class Solution {
    long minnum;
    long maxnum;
public:
    bool isValidBST2(TreeNode* head) {
        if (head == nullptr) {
            minnum = LONG_MAX;
            maxnum = LONG_MIN;
            return true;
        }
        bool lok = isValidBST2(head->left);
        long lmin = minnum;
        long lmax = maxnum;
        bool rok = isValidBST2(head->right);
        long rmin = minnum;
        long rmax = maxnum;

        minnum = std::min(std::min(lmin, rmin), (long)head->val);
        maxnum = std::max(std::max(lmax, rmax), (long)head->val);

        return lok && rok && lmax < head->val && head->val < rmin;
    }
};
```

---
## 修剪二叉搜索树 
https://leetcode.cn/problems/trim-a-binary-search-tree/description/

```CPP
class Solution {
public:
    TreeNode* trimBST(TreeNode* root, int low, int high) {
        if(root == nullptr){
            return nullptr;
        }
        if(root->val < low){
            return trimBST(root->right, low, high);
        }
        if(root->val > high){
            return trimBST(root->left, low, high);
        }
        root->left = trimBST(root->left, low, high);
        root->right = trimBST(root->right, low, high);
        return root;
    }
};
```

![](../../../images/Pasted%20image%2020260323000501.png)

---

## 打家劫舍 III 
https://leetcode.cn/problems/house-robber-iii/description/

```cpp

class Solution {
public:
    int yes, no; // yes 表示选择偷当前节点的收益, no 表示不偷当前节点的收益

    int rob(TreeNode* root) {
        f(root);  
        // 最终返回偷或不偷根节点的最大值
        return max(yes, no);
    }

    // 辅助函数 f 计算当前子树的 yes 和 no
    void f(TreeNode* cur) {
        if (cur == nullptr) {
            // 空节点，偷与不偷的收益都为 0
            yes = 0;
            no = 0;
        } else {
            // y: 偷取当前节点的收益
            // n: 不偷当前节点的收益
            int y = cur->val;
            int n = 0;

            // 处理左子树
            f(cur->left);
            // 如果偷当前节点，那么左子节点不能偷，所以只能加上左子树的不偷收益 no
            y += no;
            // 如果不偷当前节点，那么左子节点可以偷也可以不偷，取两者最大值
            n += max(yes, no);

            // 处理右子树
            f(cur->right);
            // 同理，偷当前节点 → 右子节点不能偷，只能加上 no
            y += no;
            // 不偷当前节点 → 右子节点可偷可不偷，取最大值
            n += max(yes, no);

            // 更新当前节点的 yes 和 no
            yes = y;
            no = n;
        }
    }
};
```


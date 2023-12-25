# syncnextPlugin

Syncnext 插件化

## 文檔地址

https://www.notion.so/qoli/Syncnext-dbd9831184f140a8baf56c0d28a7cac2?pvs=4

# 插件化更新日誌

## Alpha 4

需要 Syncnext 1.69 版本開始支持。

### 修正

- 改寫了 Search 的使用方法。

```jsx
function Search(inputURL, key) {
  // Your Codes ...

  // 向 Syncnext 返回封面牆數據
  $next.toMedias(JSON.stringify(returnDatas), key);
}
```

[Alpha v3 更新到 v4 的寫法變更](https://www.notion.so/Alpha-v3-v4-e81399ed524d41529d71e3ec44773425?pvs=21)

## Alpha 3

- 增加了阿里雲盤的 api
- 增加了權限檢查（是否登入阿里雲盤）

## Alpha 2

- 重建了設計方案。

## Alpha 1

- 基本可用。

---
title: 'My First Post'
description: 'This post is purely for testing the table of content, which should not be rendered'
publishDate: '03 Jul 2024'
tags: ['react']
draft: true
---

# React

## useCallBack与useEventCallBack

https://juejin.cn/post/7077015078117048334

## 关于跳过Hook顺序执行

https://zhuanlan.zhihu.com/p/357232384

## Fragment与key

在jsx中通过map进行渲染需要添加key，当使用

```
{
	data.map(item => (
		<>
			<Child key={index}/>
		</>
	))
}
```

仍然会报重复key的错误

需要用React.Fragment设置key，而不是设置在Child上

```
{
	data.map(item => (
		<React.Fragment>
			<Child key={index}/>
		</React.Fragment>
	))
}
```

## 【待验证】

在 JSX 中，不能直接访问当前 JSX 块外部的变量或上下文。这是因为 JSX 在编译时被转换为普通的 JavaScript 代码，而 JSX 块内部被视为一个独立的作用域。如果你想在 JSX 内部使用外部的变量，你需要将这些变量作为参数传递给 JSX 块内的函数。

让我们通过一个简单的例子来说明这一点：

```jsx
import React from 'react'

const OuterComponent = () => {
	const externalVariable = 'Hello from outer component'

	const InnerComponent = ({ variableFromOuterScope }) => {
		return <div>{variableFromOuterScope}</div>
	}

	return (
		<div>
			<h1>Outer Component</h1>
			<InnerComponent variableFromOuterScope={externalVariable} />
		</div>
	)
}

export default OuterComponent
```

在这个例子中，`InnerComponent` 是 `OuterComponent` 内部的一个子组件。我们想要在 `InnerComponent` 中使用 `externalVariable`。为了做到这一点，我们将 `externalVariable` 作为参数传递给 `InnerComponent`。

如果我们尝试在 `InnerComponent` 中直接访问 `externalVariable`，而不通过参数传递，就会导致错误，因为在 JSX 中无法访问 `OuterComponent` 的作用域。

```jsx
// 错误示例，不能在 JSX 中直接访问 externalVariable
const InnerComponent = () => {
	// 这里无法直接访问 externalVariable
	return <div>{externalVariable}</div>
}
```

通过将变量作为参数传递，我们可以在 JSX 内部正确地访问外部作用域的变量。这个原则同样适用于其他上下文，如事件处理函数等。

## Why-When-How to use memo and callback

[博客地址](https://www.developerway.com/posts/how-to-use-memo-use-callback)

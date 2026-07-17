---
title: Jenkins はインライン CSS スタイルの読み込みを許可します
author: Lee
---

## Groovy スクリプト

Jenkins セキュリティポリシー：

- JavaScript の使用は一切許可されていません
- プラグイン（object/embed）は許可されていません
- インライン CSS や他サイトの CSS は許可されていません
- 他サイトからの画像は許可されていません
- フレームの使用は許可されていません
- ウェブフォントは許可されていません
- XHR/AJAX は許可されていません
- など。

デフォルトではサーバー内部のリソースのみが許可されており、インラインスタイルを許可するには、Manage Jenkins → Script console で以下のコードを実行してください。または、パイプライン + Groovy plugin を使用して処理内で実行できます。

```Groovy
System.setProperty("hudson.model.DirectoryBrowserSupport.CSP", "sandbox allow-same-origin; default-src 'self'; style-src 'self' 'unsafe-inline';")
```

詳細については、[公式ドキュメント](https://www.jenkins.io/doc/book/security/configuring-content-security-policy/) をご覧ください。

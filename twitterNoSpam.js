/** string全体に全く日本語が無ければfalse */
const isJapanese = (string) => {
  /** 日本語以外が含まれていたらfalse */
  const ja2Bit = (str) => {
    return str.match(
      /^[\u30a0-\u30ff\u3040-\u309f\u3005-\u3006\u30e0-\u9fcf]+$/
    )
      ? true
      : false
  }

  /** 受け取った文字列を一文字ずつ配列にする */
  const array = [...string]
  for (word of array) {
    if (ja2Bit(word)) {
      return true
    }
  }
  return false
}

console.log('Twitter No Spam is active')
setInterval(() => {
  const sections = document.querySelectorAll('section>div>div')
  if (sections.length) {
    for (item of sections[0].children) {
      if (item.dataset.testid === 'cellInnerDiv' && item.children[0]) {
        /** ポスト関係のdivならTrue、それ以外はundefined */
        const isPost = item.children[0].children[0]
        if (isPost && isPost.querySelector('article')) {
          /** ポスト内に含まれるaタグ */
          let aTags = isPost.querySelector('article').querySelectorAll('a')
          for (aTag of aTags) {
            /** ポストのユーザー名 */
            let username
            /** アカウント名は日本語が含まれているか？ */
            let isJapaneseName
            /** 認証バッチはあるか？ */
            let isOfficial

            /** アカウント名解析 */
            let spans = aTag.querySelector('div>div>span>span')
            if (spans && !spans.children[0]) {
              username = spans.innerHTML
              isJapaneseName = isJapanese(username)
            }

            /** 公式アカウント察知用 */
            let svg = aTag.querySelector('div>div>span>svg')
            isOfficial = svg

            if (!isJapaneseName && isOfficial) {
              /** スパムタグが付いていない場合に、スパムタグを追加 */
              if (!isPost.classList.contains('is-spam')) {
                console.log(username + 'はアフィカスかも？')
                isPost.classList.add('is-spam')

                /** スパムを削除したことを表示 */
                const spamRemovedDiv = document.createElement('div')
                const spamRemovedText = document.createTextNode(
                  'スパムかもしれないポストを非表示にしました！'
                )
                spamRemovedDiv.appendChild(spamRemovedText)
                spamRemovedDiv.classList.add('spam-removed')
                isPost.before(spamRemovedDiv)
              }
            }
          }
        }
      }
    }
  }
}, 1000)

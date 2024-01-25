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

/** オプションの項目 */
const options = {
  whitelist: undefined,
}
/** セットアップ完了時にtrueにする */
let setuped = false

/** 読み込み時に動く処理 */
chrome.storage.sync.get(['whitelist'], (item) => {
  options.whitelist = item.whitelist.split(',')
  setuped = true
})

/** Welcomeメッセージ */
console.log('Twitter No Spam is active')

/** 定期実行 */
setInterval(() => {
  /** セットアップ未完了時に実行しない */
  if (!setuped) {
    return
  }
  /** URLでリプ欄が表示される場所かを判定 */
  if (!location.pathname.includes('/status/')) {
    return
  }
  const sections = document.querySelectorAll('section>div>div')
  if (sections.length) {
    let count = 0
    for (item of sections[0].children) {
      if (!count) {
        count++
        continue
      }
      if (item.dataset.testid === 'cellInnerDiv' && item.children[0]) {
        /** ポスト関係のdivならTrue、それ以外はundefined */
        const isPost = item.children[0].children[0]
        if (isPost && isPost.querySelector('article')) {
          /** ポスト内に含まれるaタグ */
          let aTags = isPost.querySelector('article').querySelectorAll('a')
          for (aTag of aTags) {
            /** ポストのユーザー名 */
            let username
            /** ポストのユーザーID */
            let id
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
            if (svg) {
              if (svg.ariaLabel != '認証済みアカウント') {
                isOfficial = false
              }
            }

            if (!isJapaneseName && isOfficial) {
              /** スパムタグが付いていない場合に、スパムタグを追加 */
              if (
                !isPost.classList.contains('is-spam') &&
                !isPost.classList.contains('is-not-spam')
              ) {
                for (a of aTags) {
                  if (
                    a.querySelector('div>span') &&
                    !a.querySelector('div>span').children[0]
                  ) {
                    id = a.querySelector('div>span').innerHTML
                    break
                  }
                }

                let continueFlag = false
                for (whiteId of options.whitelist) {
                  if (whiteId === id) {
                    /** スパムじゃないよタグを付ける */
                    isPost.classList.add('is-not-spam')
                    console.log(
                      `${username}(${id})はホワイトリストに含まれています`
                    )
                    continueFlag = true
                  }
                }
                if (continueFlag) {
                  continue
                }

                console.log(`${username}(${id})はアフィカスかも？`)

                /** スパムタグを付ける */
                isPost.classList.add('is-spam')

                /** スパムを削除したことを表示 */
                const spamRemovedDiv = document.createElement('div')
                const spamRemovedText = document.createTextNode(
                  `${username}(${id})のリプを非表示にしました！`
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

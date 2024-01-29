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
  whitelist: [],
  blacklist: [],
  blackwordlist: ['プロフみて', 'プロフ見て'],
  viewRemovedAccountInfo: true,
}
/** セットアップ完了時にtrueにする */
let setuped = false

/** 読み込み時に動く処理 */
chrome.storage.sync.get(
  ['whitelist', 'blacklist', 'blackwordlist', 'viewRemovedAccountInfo'],
  (item) => {
    if (item.whitelist) {
      options.whitelist = item.whitelist.split(',')
    }
    if (item.blackwordlist || item.blackwordlist === undefined) {
      options.blackwordlist = item.blackwordlist.split(',')
    }
    if (item.blacklist) {
      options.blacklist = item.blacklist.split(',')
    }
    options.viewRemovedAccountInfo = item.viewRemovedAccountInfo
    if (options.viewRemovedAccountInfo === undefined) {
      options.viewRemovedAccountInfo = true
    }

    setuped = true
  }
)

/** Welcomeメッセージ */
console.log('Twitter No Spam is active')

/** 定期実行 */
setInterval(() => {
  /** セットアップ未完了時に実行しない */
  if (!setuped) {
    return
  }
  /** URLでリプ欄が表示される場所かを判定 */
  if (
    !location.pathname.includes('/status/') &&
    !location.pathname.includes('/search')
  ) {
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
          const aTags = isPost.querySelector('article').querySelectorAll('a')
          /** ミュートしているアカウントによるポストです。の文字 */
          const alreadyMuted = isPost.querySelector(
            'article>div>div>div>div>div>div>div>span>span>span'
          )
          if (
            alreadyMuted &&
            alreadyMuted.innerHTML ===
              'ミュートしているアカウントによるポストです。'
          ) {
            /** スパムタグが付いていない場合に、スパムタグを追加 */
            if (
              !isPost.classList.contains('is-spam') &&
              !isPost.classList.contains('is-not-spam')
            ) {
              /** スパムタグを付ける */
              isPost.classList.add('is-spam')

              /** オプションで有効になっている場合は、スパムを削除したことを表示 */
              if (options.viewRemovedAccountInfo) {
                const spamRemovedDiv = document.createElement('div')
                const spamRemovedText = document.createTextNode(
                  `ミュートしているアカウントによるポストです`
                )
                spamRemovedDiv.appendChild(spamRemovedText)
                spamRemovedDiv.classList.add('spam-removed')
                isPost.before(spamRemovedDiv)
              }
              continue
            }
          }

          let aTagCount = 0
          for (aTag of aTags) {
            /** ポストのユーザー名 */
            let username
            /** ポストのユーザーID */
            let id
            /** アカウント名は日本語が含まれているか？ */
            let isJapaneseName
            /** 認証バッチはあるか？ */
            let isOfficial
            /** ツイートの本文 */
            let tweetText = ''
            /** 絵文字またはURLのみのツイートならTrueになる */
            let isBlackText = false
            /** 非推奨ワードがツイートに含まれていたらTrueになる */
            let hasBlackWord = false

            /** アカウント名解析 */
            let spans = aTag.querySelector('div>div>span>span')
            if (spans && !spans.children[0]) {
              username = spans.innerHTML
              isJapaneseName = isJapanese(username)
            } else {
              continue
            }

            /** 公式アカウント察知用 */
            let svg = aTag.querySelector('div>div>span>svg')
            isOfficial = svg
            if (svg) {
              if (svg.ariaLabel != '認証済みアカウント') {
                isOfficial = false
              }
            }

            for (a of aTags) {
              if (
                a.querySelector('div>span') &&
                !a.querySelector('div>span').children[0]
              ) {
                id = a.querySelector('div>span').innerHTML
                break
              }
            }

            /** ブラックリスト判定フラグ */
            let isBlack = false
            for (blackId of options.blacklist) {
              if (blackId === id) {
                isBlack = true
              }
            }

            /** ツイートの中身を取得する用 */
            const tweetDivs = isPost.querySelectorAll(
              'article>div>div>div>div>div>div'
            )
            if (
              tweetDivs &&
              !aTagCount &&
              !isPost.classList.contains('is-not-spam-text') &&
              !isPost.classList.contains('is-spam-text')
            ) {
              for (tweetDiv of tweetDivs) {
                if (tweetDiv.children) {
                  for (tweetSpan of tweetDiv.children) {
                    if (
                      tweetSpan.tagName !== 'DIV' &&
                      tweetSpan.tagName !== 'ARTICLE' &&
                      tweetSpan.tagName !== 'G'
                    ) {
                      if (tweetSpan.tagName === 'IMG') {
                        tweetText += tweetSpan.getAttribute('alt')
                      } else {
                        tweetText += tweetSpan.innerText
                      }
                    }
                  }
                  if (tweetText !== '') {
                    break
                  }
                }
                if (tweetText !== '') {
                  break
                }
              }

              /** 絵文字の文字コード */
              const regEmoji = new RegExp(
                /[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/,
                'g'
              )
              /** 絵文字削除 */
              const removeEmoji = (input) =>
                // 絵文字を空文字('')に置き換える
                input.replace(regEmoji, '')

              tweetText = removeEmoji(tweetText)

              /** ブラックワードリストの単語が含まれてないか照合 */
              for (blackWord of options.blackwordlist) {
                if (tweetText.includes(blackWord)) {
                  hasBlackWord = true
                }
              }
              if (
                tweetText !== '' &&
                !URL.canParse(tweetText) &&
                !hasBlackWord
              ) {
                /** スパムじゃないよタグを付ける */
                isPost.classList.add('is-not-spam-text')
              } else {
                /** スパムタグを付ける */
                isPost.classList.add('is-spam-text')
                isBlackText = true
              }
            }

            /** ブラックリスト判定時には、usernameがtrueかどうかの判定が必要 */
            if (
              (!isJapaneseName && isOfficial) ||
              (username && isBlack) ||
              isBlackText
            ) {
              /** スパムタグが付いていない場合に、スパムタグを追加 */
              if (
                !isPost.classList.contains('is-spam') &&
                !isPost.classList.contains('is-not-spam')
              ) {
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

                if (isBlack) {
                  console.log(`${username}(${id})はブラックリストです`)
                } else {
                  if (isBlackText) {
                    console.log(`${username}(${id})のリプは品質が低いです`)
                  } else {
                    console.log(`${username}(${id})はアフィカスかも？`)
                  }
                }

                /** スパムタグを付ける */
                isPost.classList.add('is-spam')

                /** オプションで有効になっている場合は、スパムを削除したことを表示 */
                if (options.viewRemovedAccountInfo) {
                  const spamRemovedDiv = document.createElement('div')
                  const spamRemovedText = document.createTextNode(
                    isBlack
                      ? `${username}(${id})はブラックリストに登録されています`
                      : isBlackText
                      ? `${username}(${id})のリプは品質が低いです`
                      : `${username}(${id})のリプを非表示にしました！`
                  )
                  spamRemovedDiv.appendChild(spamRemovedText)
                  spamRemovedDiv.classList.add('spam-removed')
                  isPost.before(spamRemovedDiv)
                }
              }
            }
            aTagCount++
          }
        }
      }
    }
  }
}, 500)

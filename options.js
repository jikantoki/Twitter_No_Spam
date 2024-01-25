/** オプションの項目 */
const options = {
  whitelist: undefined,
}

/** 読み込み時に動く処理 */
document.addEventListener('DOMContentLoaded', async () => {
  await chrome.storage.sync.get(['whitelist'], (item) => {
    options.whitelist = item.whitelist

    if (options.whitelist) {
      document.getElementById('option-whitelist-textarea').value =
        options.whitelist
    }
  })

  /** 保存時の処理 */
  document
    .getElementById('option-save-button')
    .addEventListener('click', () => {
      /** ホワイトリストの項目 */
      const whitelist = document.getElementById(
        'option-whitelist-textarea'
      ).value
      chrome.storage.sync.set(
        {
          whitelist: whitelist,
        },
        function () {}
      )
      console.log('saved')
    })
})

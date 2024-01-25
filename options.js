/** オプションの項目 */
const options = {
  whitelist: undefined,
  viewRemovedAccountInfo: true,
}

/** 読み込み時に動く処理 */
document.addEventListener('DOMContentLoaded', async () => {
  await chrome.storage.sync.get(
    ['whitelist', 'viewRemovedAccountInfo'],
    (item) => {
      options.whitelist = item.whitelist
      options.viewRemovedAccountInfo = item.viewRemovedAccountInfo

      if (options.whitelist) {
        document.getElementById('option-whitelist-textarea').value =
          options.whitelist
      }
      if (!options.viewRemovedAccountInfo) {
        document.getElementById('option-dataview-checkbox').checked = false
      }
    }
  )

  /** 保存時の処理 */
  document
    .getElementById('option-save-button')
    .addEventListener('click', () => {
      /** ホワイトリストの項目 */
      const whitelist = document.getElementById(
        'option-whitelist-textarea'
      ).value
      /** 非表示にしたアカウントの情報を表示するか？ */
      const viewRemovedAccountInfo = document.getElementById(
        'option-dataview-checkbox'
      ).checked
      chrome.storage.sync.set(
        {
          whitelist: whitelist,
          viewRemovedAccountInfo: viewRemovedAccountInfo,
        },
        function () {}
      )
      document.getElementById('option-saved-text').style.display = 'block'
      setTimeout(() => {
        document.getElementById('option-saved-text').style.display = 'none'
      }, 2000)
      console.log('saved')
    })
})

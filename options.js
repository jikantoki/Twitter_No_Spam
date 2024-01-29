/** オプションの項目 */
const options = {
  whitelist: undefined,
  blacklist: undefined,
  blackwordlist: undefined,
  viewRemovedAccountInfo: true,
}

/** 読み込み時に動く処理 */
document.addEventListener('DOMContentLoaded', async () => {
  await chrome.storage.sync.get(
    ['whitelist', 'blacklist', 'blackwordlist', 'viewRemovedAccountInfo'],
    (item) => {
      options.whitelist = item.whitelist
      options.blacklist = item.blacklist
      options.blackwordlist = item.blackwordlist
      options.viewRemovedAccountInfo = item.viewRemovedAccountInfo

      if (options.whitelist) {
        document.getElementById('option-whitelist-textarea').value =
          options.whitelist
      }
      if (options.blacklist) {
        document.getElementById('option-blacklist-textarea').value =
          options.blacklist
      }
      if (options.blackwordlist) {
        document.getElementById('option-blackwordlist-textarea').value =
          options.blackwordlist
      }
      if (options.blackwordlist === false || options.blackwordlist === '') {
        document.getElementById('option-blackwordlist-textarea').value = ''
      }
      if (!options.viewRemovedAccountInfo) {
        if (options.viewRemovedAccountInfo === false) {
          document.getElementById('option-dataview-checkbox').checked = false
        }
      }
    }
  )

  /** オプションフォーム内エンターキーで保存 */
  document.getElementById('option').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      document.getElementById('option-save-button').click()
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
      /** ブラックリストの項目 */
      const blacklist = document.getElementById(
        'option-blacklist-textarea'
      ).value
      /** ブラックワードリストの項目 */
      const blackwordlist = document.getElementById(
        'option-blackwordlist-textarea'
      ).value
      /** 非表示にしたアカウントの情報を表示するか？ */
      const viewRemovedAccountInfo = document.getElementById(
        'option-dataview-checkbox'
      ).checked
      chrome.storage.sync.set(
        {
          whitelist: whitelist,
          blacklist: blacklist,
          blackwordlist: blackwordlist,
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

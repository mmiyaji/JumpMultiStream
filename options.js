// デフォルトの設定値
const defaultExcludedUrls = [
  "videos",
  "directory",
  "turbo",
  "p",
  "downloads",
  "jobs",
  "privacy",
  "search",
  "annual-recap",
  "settings",
  "subscriptions"
].join(", ");

const defaultDestinationSite = "https://multistre.am/";

// 設定を保存
document.getElementById('saveSettings').addEventListener('click', () => {
  const destinationSite = document.getElementById('destinationSite').value;
  const excludedUrls = document.getElementById('excludedUrls').value;

  chrome.storage.sync.set({ destinationSite, excludedUrls }, () => {
    alert('設定が保存されました！');
  });
});

// 設定をデフォルトに戻す
document.getElementById('defaultSettings').addEventListener('click', () => {
  // デフォルト値を入力欄にセット
  document.getElementById('destinationSite').value = defaultDestinationSite;
  document.getElementById('excludedUrls').value = defaultExcludedUrls;

  // 保存も行う
  chrome.storage.sync.set({ destinationSite: defaultDestinationSite, excludedUrls: defaultExcludedUrls }, () => {
    alert('デフォルト値に戻しました！');
  });
});

// ページロード時に設定をロード
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['destinationSite', 'excludedUrls'], (data) => {
    // 遷移先サイトの初期値を設定（保存済みデータがあればそれを使用）
    document.getElementById('destinationSite').value = data.destinationSite || defaultDestinationSite;

    // 除外するURLリストの初期値を設定（保存済みデータがなければデフォルト値を使用）
    document.getElementById('excludedUrls').value = data.excludedUrls || defaultExcludedUrls;
  });
});

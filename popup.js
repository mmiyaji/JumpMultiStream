// 初期化: 設定値を読み込む
let excludedPaths = [];
let destinationSite = "https://multistre.am/";

chrome.storage.sync.get(['excludedUrls', 'destinationSite'], (data) => {
  // 除外リストを初期化（設定されていない場合デフォルト値を使用）
  excludedPaths = (data.excludedUrls ? data.excludedUrls.split(",").map(url => url.trim()) : [
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
  ]);

  // 遷移先サイトを初期化（設定されていない場合デフォルト値を使用）
  destinationSite = data.destinationSite || "https://multistre.am/";
});

// タブの情報を取得してユーザーIDリストを生成
chrome.tabs.query({}, (tabs) => {
  const userList = document.getElementById("userList");

  // TwitchユーザーIDを抽出
  const twitchUsers = tabs
    .filter(tab => {
      if (!tab.url) return false;

      const url = new URL(tab.url);

      // サブドメインがwww, m, またはサブドメインなしの場合のみ許可
      const hostnameParts = url.hostname.split(".");
      const subdomain = hostnameParts.length === 3 ? hostnameParts[0] : null;
      const domain = hostnameParts.slice(-2).join("."); // twitch.tvに対応

      if (domain !== "twitch.tv") return false; // twitch.tvドメイン以外を除外
      if (subdomain && !["www", "m"].includes(subdomain)) return false; // www, m以外のサブドメインを除外

      // パスのセグメントを抽出し、除外リストに含まれるものを除外
      const pathSegments = url.pathname.split("/").filter(segment => segment);
      return pathSegments.length > 0 && !excludedPaths.includes(pathSegments[0]);
    })
    .map(tab => {
      const url = new URL(tab.url);
      const pathSegments = url.pathname.split("/").filter(segment => segment);
      return pathSegments.length > 0 ? pathSegments[0] : null; // 最初のセグメントをユーザIDとする
    })
    .filter(user => user); // null を除外

  // 重複を除外
  const uniqueUsers = [...new Set(twitchUsers)];

  if (uniqueUsers.length === 0) {
    // ユーザーIDが見つからない場合、ポップアップにメッセージを表示
    const noUsersMessage = document.createElement("p");
    noUsersMessage.textContent = "The Twitch user you are viewing cannot be found. Please open the streaming page in another tab.";
    noUsersMessage.className = "text-danger text-center mt-3";
    userList.appendChild(noUsersMessage);
    return;
  }

  // ユーザーIDをチェックボックスリストとして表示
  uniqueUsers.forEach(user => {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = `checkbox-${user}`; // ユニークなIDを設定
    checkbox.value = user;
    checkbox.checked = true; // デフォルトで選択状態
    checkbox.className = "form-check-input me-2";

    const label = document.createElement("label");
    label.htmlFor = `checkbox-${user}`; // ラベルのfor属性をチェックボックスIDに紐付け
    label.textContent = user;
    label.className = "form-check-label";

    listItem.appendChild(checkbox);
    listItem.appendChild(label);
    userList.appendChild(listItem);
  });
});

// ボタンのクリックイベントで新しいタブを開く
document.getElementById("openMultiStream").addEventListener("click", () => {
  const selectedUsers = Array.from(document.querySelectorAll("#userList input:checked"))
    .map(input => input.value);

  if (selectedUsers.length > 0) {
    // 設定された遷移先サイトを使用
    const multiStreamUrl = `${destinationSite}${selectedUsers.join("/")}/`;
    chrome.tabs.create({ url: multiStreamUrl });
  } else {
    alert("Please select at least one user.");
  }
});

// 設定アイコンがクリックされた際に、設定画面に遷移
document.getElementById('settings-icon').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

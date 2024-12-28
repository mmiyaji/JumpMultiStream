chrome.action.onClicked.addListener(() => {
    chrome.tabs.query({}, (tabs) => {
        const twitchUsers = tabs
        .filter(tab => tab.url && tab.url.includes("twitch.tv"))
        .map(tab => {
            const url = new URL(tab.url);
            const pathSegments = url.pathname.split("/").filter(segment => segment); // パス部分を分割して空文字を除去
            return pathSegments.length > 0 ? pathSegments[0] : null; // 最初のセグメントをユーザIDとする
        })
        .filter(user => user); // null を除外

        console.log("Twitch Users:", twitchUsers);
        // ここでユーザIDを処理する（例: UIに表示）
    });
});

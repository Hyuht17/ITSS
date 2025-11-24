import SideMenu from '../components/SideMenu';

/**
 * メッセージ画面
 * （プレースホルダー）
 */
const Messages = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <SideMenu />

            <main className="flex-1 p-4 md:p-8">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">
                        メッセージ
                    </h1>

                    <div className="bg-white rounded-lg shadow-md p-8 text-center">
                        <div className="text-6xl mb-4">💬</div>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                            メッセージ機能
                        </h2>
                        <p className="text-gray-600">
                            この機能は現在開発中です。近日公開予定です。
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Messages;

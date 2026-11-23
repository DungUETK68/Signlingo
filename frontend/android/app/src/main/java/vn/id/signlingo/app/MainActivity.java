package vn.id.signlingo.app;

import android.content.pm.ActivityInfo;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Khóa cố định màn hình nằm dọc (Portrait-only) cho ứng dụng di động Signlingo
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);

        // Bật tăng tốc phần cứng để MediaPipe WebAssembly/WebGL đạt tốc độ khung hình mượt mà
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED,
            WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED
        );

        configureSignlingoWebView();
    }

    private void configureSignlingoWebView() {
        if (this.bridge == null || this.bridge.getWebView() == null) {
            return;
        }

        WebView webView = this.bridge.getWebView();
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);

        WebSettings settings = webView.getSettings();
        // Cho phép video bài học mẫu VSL tự động phát mà không cần người dùng chạm trước
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setJavaScriptCanOpenWindowsAutomatically(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
    }
}

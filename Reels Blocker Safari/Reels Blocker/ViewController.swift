import Cocoa
import SafariServices

class ViewController: NSViewController {

    @IBOutlet var appNameLabel: NSTextField!

    override func viewDidLoad() {
        super.viewDidLoad()
        self.appNameLabel.stringValue = "Reels Blocker"
        SFSafariExtensionManager.getStateOfSafariExtension(
            withIdentifier: extensionBundleIdentifier
        ) { state, error in
            guard let state = state, error == nil else { return }
            DispatchQueue.main.async {
                if state.isEnabled {
                    self.appNameLabel.stringValue = "Reels Blocker's extension is currently on."
                } else {
                    self.appNameLabel.stringValue = "Reels Blocker's extension is currently off. You can turn it on in Safari Extensions preferences."
                }
            }
        }
    }

    @IBAction func openSafariExtensionPreferences(_ sender: AnyObject?) {
        SFSafariApplication.showPreferencesForExtension(
            withIdentifier: extensionBundleIdentifier
        ) { error in
            guard error == nil else { return }
            DispatchQueue.main.async {
                NSApplication.shared.terminate(nil)
            }
        }
    }
}

let extensionBundleIdentifier = "com.reelsblocker.Reels-Blocker.Extension"

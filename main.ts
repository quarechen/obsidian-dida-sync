import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface GlobalSettings {
	email: string;
	password: string;
}

const DEFAULT_SETTINGS: GlobalSettings = {
	email: 'default',
	password: 'default'
}

export default class DidaSyncPlugin extends Plugin {
	settings: GlobalSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', '同步清单', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('hello!');
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem();
		statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(this.app).open();
			}
		});
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(this.app).open();
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new GlobalSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class GlobalSettingTab extends PluginSettingTab {
	plugin: DidaSyncPlugin;

	constructor(app: App, plugin: DidaSyncPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('邮箱')
			.setDesc('嘀嗒清单的账号邮箱')
			.addText(text => text
				.setPlaceholder('输入邮箱')
				.setValue(this.plugin.settings.email)
				.onChange(async (value) => {
					this.plugin.settings.email = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
		.setName('密码')
		.setDesc('账号的密码')
		.addText((text) => {
			text
				.setPlaceholder('输入密码')
				.setValue(this.plugin.settings.email)
				.onChange(async (value) => {
					this.plugin.settings.password = value;
					await this.plugin.saveSettings();
				});
	
			// 设置输入元素的类型为 "password" 以隐藏密码
			text.inputEl.type = "password";
	
			// 添加切换按钮
			new Setting(containerEl)
				.addToggle((toggle) => {
					toggle
						.setValue(false)
						.setTooltip('显示密码')
						.onChange(async (value) => {
							// 如果切换按钮被选中（value 为 true），则将输入元素的类型设置为 "text" 以显示密码
							// 否则，将输入元素的类型设置为 "password" 以隐藏密码
							text.inputEl.type = value ? "text" : "password";
						});
				});
		});
	}
}
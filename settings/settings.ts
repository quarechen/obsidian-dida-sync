import { App,  PluginSettingTab, Setting } from 'obsidian';
import { FolderSuggest } from 'suggests/file-suggest';
import DidaSyncPlugin from 'main';

// Remember to rename these classes and interfaces!

export interface GlobalSettings {
	email: string;
	password: string;
    project_id: string;
	save_dir: string;
}
export const DEFAULT_SETTINGS: GlobalSettings = {
	email: '',
	password: '',
    project_id: '',
	save_dir: ''
}

export class GlobalSettingTab extends PluginSettingTab {
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
				.setValue(this.plugin.settings.password)
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

        new Setting(containerEl)
        .setName('项目id')
        .setDesc('嘀嗒清单的需要同步的项目id')
        .addText(text => text
            .setPlaceholder('输入id')
            .setValue(this.plugin.settings.project_id)
            .onChange(async (value) => {
                this.plugin.settings.project_id = value;
                await this.plugin.saveSettings();
            }));

		new Setting(containerEl)
			.setName('保存的文件夹')
			.setDesc('要保存到 ob 的文件夹')
			.addSearch((cb)=>{
				new FolderSuggest(this.app, cb.inputEl);
				cb.setValue(this.plugin.settings.save_dir)
				.onChange(async (newFolder)=>{
					this.plugin.settings.save_dir = newFolder
					await this.plugin.saveSettings()
				});
			})
	}
}
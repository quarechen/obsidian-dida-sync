import Dida365Api from 'dida/dida';
import { moment,App, CachedMetadata, Modal, Notice, Plugin,TFile  } from 'obsidian';
import { GlobalSettings,DEFAULT_SETTINGS,GlobalSettingTab } from 'settings/settings';
import * as YAML from 'yaml';

export default class DidaSyncPlugin extends Plugin {
	settings: GlobalSettings;

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon('dice', '同步清单', (evt: MouseEvent) => {
			// Called when the user clicks the icon.
			new Notice('start');
			let dida = new Dida365Api(this.settings.email,this.settings.password)
			const tasks = dida.getTasks(this.settings.project_id)
			tasks.then((taskItems) => {
				taskItems.forEach(async(item) => {
					new Notice(item.title);
					const path = this.settings.save_dir+"/"+item.title+'.md'
					const file = this.app.vault.getAbstractFileByPath(path);
					if (!file) {
						// 文件不存在，创建文件并写入数据
						const newfile = await this.app.vault.create(path, item.content);
						this.addToFrontmatter(newfile, 'tags', item.tags, true)
						this.addToFrontmatter(newfile, '项目地址', `${dida.projectURL(item)}`, false)
						this.addToFrontmatter(newfile, '任务地址', `${dida.taskURL(item)}`, false)
					}else{
						// 文件已经存在，向文件中追加数据
						const now = moment().format("YYYY-MM-DD HH:mm:ss");
						const prefix = '\n\n---\n\n'
						const newData = `${prefix}更新时间: ${now}\n${item.content}`;
						this.app.vault.append(file as TFile, newData);
					}
					dida.completeTask(item)
					console.log("file:",file)
				})
			})
		});
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class');

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		// const statusBarItemEl = this.addStatusBarItem();
		// statusBarItemEl.setText('Status Bar Text');

		// This adds a simple command that can be triggered anywhere
		// this.addCommand({
		// 	id: 'open-sample-modal-simple',
		// 	name: 'Open sample modal (simple)',
		// 	callback: () => {
		// 		new SampleModal(this.app).open();
		// 	}
		// });
		// // This adds an editor command that can perform some operation on the current editor instance
		// this.addCommand({
		// 	id: 'sample-editor-command',
		// 	name: 'Sample editor command',
		// 	editorCallback: (editor: Editor, view: MarkdownView) => {
		// 		console.log(editor.getSelection());
		// 		editor.replaceSelection('Sample Editor Command');
		// 	}
		// });
		// // This adds a complex command that can check whether the current state of the app allows execution of the command
		// this.addCommand({
		// 	id: 'open-sample-modal-complex',
		// 	name: 'Open sample modal (complex)',
		// 	checkCallback: (checking: boolean) => {
		// 		// Conditions to check
		// 		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// 		if (markdownView) {
		// 			// If checking is true, we're simply "checking" if the command can be run.
		// 			// If checking is false, then we want to actually perform the operation.
		// 			if (!checking) {
		// 				new SampleModal(this.app).open();
		// 			}

		// 			// This command will only show up in Command Palette when the check function returns true
		// 			return true;
		// 		}
		// 	}
		// });

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
	async addToFrontmatter(file: TFile, key: string, value: string | string[], isArray = false) {
		console.log("file:",file)
		let cache = this.app.metadataCache.getFileCache(file) as CachedMetadata;
		if (!cache) {
			await new Promise(resolve => setTimeout(resolve, 1000));
		 	cache = this.app.metadataCache.getFileCache(file) as CachedMetadata;
			if (!cache) {
				console.error(`Cannot set frontmatter property for file again ${file.path}`);
				return;
			}
		}
		if (!cache.frontmatter) {
			cache.frontmatter = {};
		}
		if (isArray) {
			cache.frontmatter[key] = Array.isArray(cache.frontmatter[key])
				? [...cache.frontmatter[key], ...value]
				: value;
		} else {
			cache.frontmatter[key] = value;
		}
		const metadataString = '---\n' + YAML.stringify(cache.frontmatter) + '---\n';
		const content = await this.app.vault.read(file);
		const match = content.match(/^---\s*([\s\S]*?)\s*---\s*/);
		if (match) {
			const newMetadataString = YAML.stringify(cache.frontmatter);
			const newContent = content.replace(/^---\s*[\s\S]*?---\s*/, '---\n' + newMetadataString + '---\n');
			await this.app.vault.modify(file, newContent);
		} else {
			const newContent = metadataString + content;
			await this.app.vault.modify(file, newContent);
		}
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
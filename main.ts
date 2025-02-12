import { App, Editor, Plugin, PluginSettingTab, Setting } from 'obsidian';

interface VimModeSettings {
	interval: number;
}
const DEFAULT_SETTINGS: VimModeSettings = {
	interval: 100
}

export default class VimModePlugin extends Plugin {
	barText:  HTMLElement;
	settings: VimModeSettings;
	async onload() {
		await this.loadSettings()
		this.barText = this.addStatusBarItem();
		this.registerInterval(
			window.setInterval(
				() => this.update(), this.settings.interval)
		);
		this.update();
		this.addSettingTab(new VimModeSettingTab(this.app, this));
	}

	onunload() {
	}

	update() {
		const editor = this.app.workspace.activeEditor?.editor;	
		let text: String = "Vim Mode: ";
		if (editor) {
			const mode = editor.cm?.cm?.state.vim?.mode?.toUpperCase() ?? "INACTIVE";
			text += mode;
		}
		this.barText.setText(text);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

}

class VimModeSettingTab extends PluginSettingTab {
	plugin: VimModePlugin;

	constructor(app: App, plugin: VimModePlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}
	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		new Setting(containerEl)
			.setName('Interval')
			.setDesc('Update interval in ms')
			.addText(text => text
				.setPlaceholder('X ms')
				.setValue(this.plugin.settings.interval)
				.onChange(async (value) => {
					this.plugin.settings.interval = value;
					await this.plugin.saveSettings();
				}));
	}
}

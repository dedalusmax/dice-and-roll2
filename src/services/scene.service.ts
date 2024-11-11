import { SceneOptions, LoadingSceneOptions } from "../scenes/scene-options";
import { LoadingScene } from "../scenes/loading.scene";
import { MainMenuScene } from "../scenes/main-menu.scene";

export class SceneService {
    
    static runLoadedScene(currentScene: Phaser.Scene, loadingOptions: LoadingSceneOptions) {

        currentScene.scene.start(loadingOptions.loadScene, loadingOptions.sceneOptions);
    }

    static backToMenu(currentScene: Phaser.Scene) {

        var loadingOptions = new LoadingSceneOptions();
        loadingOptions.loadScene = 'MainMenuScene';

        currentScene.scene.start('LoadingScene', loadingOptions);
    }

    static run(currentScene: Phaser.Scene, targetScene: string, persistMusic?: boolean, options?: SceneOptions): void {

        var loadingOptions = new LoadingSceneOptions();
        
        loadingOptions.loadScene = targetScene;
        loadingOptions.persistMusic = persistMusic;
        loadingOptions.sceneOptions = options;

        currentScene.scene.start('LoadingScene', loadingOptions);
    }
}
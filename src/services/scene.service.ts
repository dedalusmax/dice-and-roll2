import { SceneOptions, LoadingSceneOptions } from "../scenes/scene-options";
import { LoadingScene } from "../scenes/loading.scene";
import { MainMenuScene } from "../scenes/main-menu.scene";

export class SceneService {
    
    static runLoadedScene(currentScene: Phaser.Scene, loadingOptions: LoadingSceneOptions) {

        currentScene.scene.start(loadingOptions.loadScene, loadingOptions.sceneOptions);
    }

    static backToMenu(currentScene: Phaser.Scene) {

        var loadingOptions = new LoadingSceneOptions();
        loadingOptions.loadScene = MainMenuScene.name;

        currentScene.scene.start(LoadingScene.name, loadingOptions);
    }

    static run(currentScene: Phaser.Scene, targetScene: Phaser.Scene, persistMusic?: boolean, options?: SceneOptions): void {

        var loadingOptions = new LoadingSceneOptions();
        
        loadingOptions.loadScene = targetScene.constructor.name;
        loadingOptions.persistMusic = persistMusic;
        loadingOptions.sceneOptions = options;

        currentScene.scene.start(LoadingScene.name, loadingOptions);
    }
}
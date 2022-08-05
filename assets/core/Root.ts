/*
 * @Author: dgflash
 * @Date: 2021-07-03 16:13:17
 * @LastEditors: dgflash
 * @LastEditTime: 2022-08-05 17:20:11
 */
import { Component, director, game, Game, log, Node, view, _decorator } from "cc";
import { ecs } from "../libs/ecs/ECS";
import { LanguageManager } from "../libs/gui/language/Language";
import { HttpRequest } from "../libs/network/HttpRequest";
import { config } from "../module/config/Config";
import { AudioManager } from "./common/audio/AudioManager";
import { EventMessage } from "./common/event/EventMessage";
import { Message } from "./common/event/MessageManager";
import { TimerManager } from "./common/manager/TimerManager";
import { GameManager } from "./game/GameManager";
import { GUI } from "./gui/GUI";
import { LayerManager } from "./gui/layer/LayerManager";
import { oops, version } from "./Oops";

const { ccclass, property } = _decorator;

export class Root extends Component {
    @property({
        type: Node,
        tooltip: "游戏层"
    })
    game: Node | null = null;

    @property({
        type: Node,
        tooltip: "界面层"
    })
    gui: Node | null = null;

    onLoad() {
        console.log(`Oops Framework v${version}`);

        this.init();
        config.init(this.run.bind(this));
    }

    update(dt: number) {
        oops.ecs.execute(dt);
    }

    /** 初始化游戏界面 */
    protected initGui() {

    }

    /** 初始化游戏业务模块 */
    protected initEcsSystem() {

    }

    /** 加载完引擎配置文件后执行 */
    protected run() {

    }

    protected init() {
        oops.language = new LanguageManager();
        oops.timer = new TimerManager(this);
        oops.audio = AudioManager.instance;
        oops.http = new HttpRequest();
        oops.game = new GameManager(this.game!);
        oops.gui = new LayerManager(this.gui!);
        this.initGui();
        oops.ecs = new ecs.RootSystem();
        this.initEcsSystem();
        oops.ecs.init();

        // 游戏显示事件
        game.on(Game.EVENT_SHOW, () => {
            log("Game.EVENT_SHOW");
            oops.timer.load();     // 平台不需要在退出时精准计算时间，直接暂时游戏时间
            oops.audio.resumeAll();
            director.resume();
            game.resume();
            Message.dispatchEvent(EventMessage.GAME_ENTER);
        });

        // 游戏隐藏事件
        game.on(Game.EVENT_HIDE, () => {
            log("Game.EVENT_HIDE");
            oops.timer.save();     // 平台不需要在退出时精准计算时间，直接暂时游戏时间
            oops.audio.pauseAll();
            director.pause();
            game.pause();
            Message.dispatchEvent(EventMessage.GAME_EXIT);
        });

        // 游戏尺寸修改事件
        var c_gui = this.gui?.addComponent(GUI)!;
        view.setResizeCallback(() => {
            c_gui.resize();
            Message.dispatchEvent(EventMessage.GAME_RESIZE);
        });
    }
}
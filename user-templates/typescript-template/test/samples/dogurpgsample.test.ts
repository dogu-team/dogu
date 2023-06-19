import { afterAll, beforeAll, By, Dest, GamiumClient, job, MovePlayerBy, prepareToolkit, test, Toolkit, UI, Until } from '@dogu-tech/toolkit';

let toolkit: Toolkit | null = null;
let gamium: GamiumClient;
let ui: UI;

Dest.withOptions({
  timeout: 15 * 60 * 1000,
}).describe(({ logger }) => {
  job('Test', () => {
    beforeAll(async () => {
      toolkit = await prepareToolkit({ gamium: true });
      gamium = toolkit.gamium;
      ui = gamium.ui();
    });

    afterAll(async () => {
      await gamium.sleep(4000);
      await gamium.actions().appQuit().tryPerform();
      await toolkit?.close();
    });

    test('Create Account', async () => {
      const result = await ui.tryFind(By.path('/Canvas[1]/Start[1]/DeleteAccountButton[1]'));
      if (result.success && (await result.value.tryWaitInteractable()).success) {
        await result.value.click();
      }
      await ui.click(By.path('/Canvas[1]/Login[1]/Panel[1]/GuestLoginBtn[1]'));
      await ui.setText(By.path('/Canvas[1]/Register[1]/InputField[1]'), Math.random().toString(36).substring(2, 11));
      await ui.click(By.path('/Canvas[1]/Register[1]/OkBtn[1]'));
      await ui.click(By.path('/Canvas[1]/Start[1]/Desc[1]'));
    });

    test('Create Character', async () => {
      await ui.click(By.path('/Canvas[1]/SelectCharacter[1]/RightPanel[1]/CharacterScrollView[1]/Viewport[1]/Content/SquareButton(Clone)[1]'));
      await ui.click(By.path('/Canvas[1]/CreateCharacter[1]/RightPanel[1]/CharacterScrollView[1]/Viewport[1]/Content[1]/SquareButton(Clone)[2]'));
      await ui.setText(By.path('/Canvas[1]/CreateCharacter[1]/RightPanel[1]/NicknamePanel[1]/InputField[1]'), Math.random().toString(36).substring(2, 11));
      await ui.click(By.path('/Canvas[1]/CreateCharacter[1]/RightPanel[1]/NicknamePanel[1]/OkButton[1]'));
      await ui.click(By.path('/Canvas[1]/SelectCharacter[1]/RightPanel[1]/StartBtn[1]'));
    });

    job('Equipment', async () => {
      test('Go to Equipment Shop', async () => {
        const player = await gamium.player(By.path('/PlayerSpawnPoint[1]/WizardCharacter(Clone)[1]'));
        await player.move(By.path('/Main Camera[1]'), By.path('/Shops[1]/EquipmentShop[1]'), { by: MovePlayerBy.Navigation });
      });

      test('Buy Products', async () => {
        const products = await ui.finds(By.path('/Canvas[1]/ShopView[1]/UIRoot[1]/Layout[1]/LeftPanel[1]/Products[1]/Scroll View[1]/Viewport[1]/Content[1]/ProductSlot(Clone)'));
        const scrollBar = await ui.find(
          By.path('/Canvas[1]/ShopView[1]/UIRoot[1]/Layout[1]/LeftPanel[1]/Products[1]/Scroll View[1]/Scrollbar[1]/Sliding Area[1]/Handle[1]/Image 1[1]'),
        );
        await scrollBar.waitInteractable();

        const targetIndexes = [2, 3, 5, 7, 9];
        for (let i = 0; i < products.length; i++) {
          if (!targetIndexes.includes(i)) continue;
          const item = products[i];

          const waitUntilInteractable = async (): Promise<boolean> => {
            const result = await gamium.tryWait(Until.elementInteractable(item), { timeoutMs: 300 });
            if (result.success) {
              await result.value.click();
              return true;
            }
            await scrollBar.drag({ x: scrollBar.info.position.x, y: scrollBar.info.position.y - 100 }, { durationMs: 100, intervalMs: 10 });
            return false;
          };
          await gamium.wait(waitUntilInteractable, { timeoutMs: 60 * 1000 });

          await ui.click(By.path('/Canvas[1]/ShopView[1]/MultipurposePopup(Clone)[1]/UIRoot[1]/Bottom[1]/Confirm[1]/Text[1]'));
        }

        await ui.click(By.path('/Canvas[1]/ShopView[1]/UIRoot[1]/RoundButton[1]'));
      });

      test('Go to Upgrade Table', async () => {
        const player = await gamium.player(By.path('/PlayerSpawnPoint[1]/WizardCharacter(Clone)[1]'));
        await player.move(By.path('/Main Camera[1]'), By.path('/Shops[1]/UpgradeTable[1]'), { by: MovePlayerBy.Navigation });
      });

      test('Upgrade equipments', async () => {
        const equipments = await ui.finds(By.path('/Canvas[1]/UpgradeView[1]/UIRoot[1]/Layout[1]/RightPanel[1]/ItemGridView[1]/GridPanel[1]/ItemSlot(Clone)'));
        for (let i = 1; i < equipments.length; i++) {
          const item = equipments[i];
          await item.waitInteractable();
          await item.click();

          await ui.click(By.path('/Canvas[1]/UpgradeView[1]/UIRoot[1]/Layout[1]/LeftPanel[1]/Panel[1]/Bottom[1]/Confirm[1]'));
          await ui.click(By.path('/Canvas[1]/UpgradeView[1]/MultipurposePopup(Clone)[1]/UIRoot[1]/Bottom[1]'));
        }

        await ui.click(By.path('/Canvas[1]/UpgradeView[1]/UIRoot[1]/RoundButton[1]'));
      });

      test('Equip', async () => {
        await ui.click(By.path('/Canvas[1]/GameSceneView[1]/MainTopBar[1]/InventoryButton[1]'));

        const equipments = await ui.finds(By.path('/Canvas[1]/InventoryView[1]/UIRoot[1]/Layout[1]/RightPanel[1]/ItemGridView[1]/GridPanel[1]/ItemSlot(Clone)'));
        for (let i = 1; i < equipments.length; i++) {
          const item = equipments[i];
          await item.waitInteractable();
          await item.click();

          await ui.click(By.path('/Canvas[1]/InventoryView[1]/MultipurposePopup(Clone)[1]/UIRoot[1]/Bottom[1]/Confirm[1]'));
        }

        await ui.click(By.path('/Canvas[1]/InventoryView[1]/UIRoot[1]/RoundButton[1]'));
      });
    });

    test('Quest', async () => {
      await ui.click(By.path('/Canvas[1]/GameSceneView[1]/MainTopBar[1]/QuestButton[1]'));

      await ui.click(
        By.path('/Canvas[1]/QuestView[1]/UIRoot[1]/Layout[1]/CenterPanel[1]/Bg[1]/Scroll View[1]/Viewport[1]/Content[1]/QuestSlot(Clone)[1]/TextPanel[1]/SquareButton[1]'),
      );

      await ui.click(By.path('/Canvas[1]/QuestView[1]/UIRoot[1]/RoundButton[1]'));
    });

    test('Hunt', async () => {
      await ui.click(By.path('/Canvas[1]/GameSceneView[1]/BottomPanel[1]/AutoHunt[1]'));
    });

    test('Check Quest Done', async () => {
      const waitUntilQuestDone = async (): Promise<boolean> => {
        const progress = await ui.getText(
          By.path('/Canvas[1]/GameSceneView[1]/QuestStackView[1]/Scroll View[1]/Viewport[1]/Content[1]/QuestStackSlot(Clone)[1]/TextPanel[1]/ProgressText[1]'),
        );
        if ('2 / 2' === progress) {
          return true;
        }
        await gamium.sleep(1000);
        return false;
      };
      await gamium.wait(waitUntilQuestDone, { timeoutMs: 80000 });

      // hunt off
      await ui.click(By.path('/Canvas[1]/GameSceneView[1]/BottomPanel[1]/AutoHunt[1]'));

      // quest done
      await ui.click(By.path('/Canvas[1]/GameSceneView[1]/MainTopBar[1]/QuestButton[1]'));

      await ui.click(
        By.path('/Canvas[1]/QuestView[1]/UIRoot[1]/Layout[1]/CenterPanel[1]/Bg[1]/Scroll View[1]/Viewport[1]/Content[1]/QuestSlot(Clone)[1]/TextPanel[1]/SquareButton[1]'),
      );

      await ui.click(By.path('/Canvas[1]/QuestView[1]/UIRoot[1]/RoundButton[1]'));
      await ui.click(By.path('/Canvas[1]/GameSceneView[1]/MainTopBar[1]/InventoryButton[1]'));
    });
  });
});

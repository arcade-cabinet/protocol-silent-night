+++ b/src/ui/SantasWorkshop.tsx
@@ -0,0 +1,295 @@
+/**
+ * Santa's Workshop Component
+ * Main menu hub for spending Nice Points on unlocks
+ */
+
+import { useState } from 'react';
+import { AudioManager } from '@/audio/AudioManager';
+import { useGameStore } from '@/store/gameStore';
+import {
+  PERMANENT_UPGRADES,
+  type PermanentUpgrade,
+  SKIN_UNLOCKS,
+  type SkinUnlock,
+  WEAPON_UNLOCKS,
+  type WeaponUnlock,
+} from '@/types/workshop';
+import styles from './SantasWorkshop.module.css';
+
+type TabType = 'weapons' | 'skins' | 'upgrades';
+
+interface SantasWorkshopProps {
+  show: boolean;
+  onClose: () => void;
+}
+
+export function SantasWorkshop({ show, onClose }: SantasWorkshopProps) {
+  const { metaProgress, spendNicePoints, unlockWeapon, unlockSkin, upgradePermanent } =
+    useGameStore();
+  const [activeTab, setActiveTab] = useState<TabType>('weapons');
+
+  if (!show) return null;
+
+  const handleClose = () => {
+    onClose();
+    AudioManager.playSFX('ui_select');
+  };
+
+  const handlePurchaseWeapon = (weapon: WeaponUnlock) => {
+    if (metaProgress.unlockedWeapons.includes(weapon.id)) return;
+
+    if (spendNicePoints(weapon.cost)) {
+      unlockWeapon(weapon.id);
+      AudioManager.playSFX('ui_select');
+    } else {
+      AudioManager.playSFX('ui_select'); // Could be a different "error" sound
+    }
+  };
+
+  const handlePurchaseSkin = (skin: SkinUnlock) => {
+    if (metaProgress.unlockedSkins.includes(skin.id)) return;
+
+    if (spendNicePoints(skin.cost)) {
+      unlockSkin(skin.id);
+      AudioManager.playSFX('ui_select');
+    } else {
+      AudioManager.playSFX('ui_select');
+    }
+  };
+
+  const handlePurchaseUpgrade = (upgrade: PermanentUpgrade) => {
+    const currentLevel = metaProgress.permanentUpgrades[upgrade.id] || 0;
+    if (currentLevel >= upgrade.maxLevel) return;
+
+    if (spendNicePoints(upgrade.cost)) {
+      upgradePermanent(upgrade.id);
+      AudioManager.playSFX('ui_select');
+    } else {
+      AudioManager.playSFX('ui_select');
+    }
+  };
+
+  const changeTab = (tab: TabType) => {
+    setActiveTab(tab);
+    AudioManager.playSFX('ui_select');
+  };
+
+  return (
+    <div className={styles.screen}>
+      <div className={styles.container}>
+        {/* Header */}
+        <div className={styles.header}>
+          <h1 className={styles.title}>
+            Santa's <span className={styles.accent}>Workshop</span>
+          </h1>
+          <div className={styles.nicePoints}>
+            <span className={styles.npLabel}>Nice Points:</span>
+            <span className={styles.npValue}>{metaProgress.nicePoints}</span>
+          </div>
+          <button type="button" className={styles.closeBtn} onClick={handleClose}>
+            ✕
+          </button>
+        </div>
+
+        {/* Tabs */}
+        <div className={styles.tabs}>
+          <button
+            type="button"
+            className={`${styles.tab} ${activeTab === 'weapons' ? styles.tabActive : ''}`}
+            onClick={() => changeTab('weapons')}
+          >
+            Weapons
+          </button>
+          <button
+            type="button"
+            className={`${styles.tab} ${activeTab === 'skins' ? styles.tabActive : ''}`}
+            onClick={() => changeTab('skins')}
+          >
+            Skins
+          </button>
+          <button
+            type="button"
+            className={`${styles.tab} ${activeTab === 'upgrades' ? styles.tabActive : ''}`}
+            onClick={() => changeTab('upgrades')}
+          >
+            Upgrades
+          </button>
+        </div>
+
+        {/* Content */}
+        <div className={styles.content}>
+          {/* Weapons Tab */}
+          {activeTab === 'weapons' && (
+            <div className={styles.grid}>
+              {WEAPON_UNLOCKS.map((weapon) => {
+                const isUnlocked = metaProgress.unlockedWeapons.includes(weapon.id);
+                const canAfford = metaProgress.nicePoints >= weapon.cost;
+
+                return (
+                  <div
+                    key={weapon.id}
+                    className={`${styles.card} ${isUnlocked ? styles.cardUnlocked : ''} ${
+                      !canAfford && !isUnlocked ? styles.cardLocked : ''
+                    }`}
+                  >
+                    <div className={styles.cardHeader}>
+                      <h3 className={styles.cardTitle}>{weapon.name}</h3>
+                      <div className={styles.cardCost}>
+                        {isUnlocked ? (
+                          <span className={styles.unlocked}>✓ UNLOCKED</span>
+                        ) : (
+                          <span className={styles.cost}>{weapon.cost} NP</span>
+                        )}
+                      </div>
+                    </div>
+                    <div className={styles.cardType}>{weapon.type}</div>
+                    <div className={styles.cardStats}>
+                      <div className={styles.stat}>
+                        <span className={styles.statLabel}>Damage:</span> {weapon.damage}
+                      </div>
+                      <div className={styles.stat}>
+                        <span className={styles.statLabel}>Fire Rate:</span> {weapon.fireRate}
+                      </div>
+                      <div className={styles.stat}>
+                        <span className={styles.statLabel}>Special:</span> {weapon.special}
+                      </div>
+                    </div>
+                    <div className={styles.cardFlavor}>{weapon.flavor}</div>
+                    {!isUnlocked && (
+                      <button
+                        type="button"
+                        className={styles.purchaseBtn}
+                        onClick={() => handlePurchaseWeapon(weapon)}
+                        disabled={!canAfford}
+                      >
+                        {canAfford ? 'UNLOCK' : 'INSUFFICIENT NP'}
+                      </button>
+                    )}
+                  </div>
+                );
+              })}
+            </div>
+          )}
+
+          {/* Skins Tab */}
+          {activeTab === 'skins' && (
+            <div className={styles.grid}>
+              {SKIN_UNLOCKS.map((skin) => {
+                const isUnlocked = metaProgress.unlockedSkins.includes(skin.id);
+                const canAfford = metaProgress.nicePoints >= skin.cost;
+
+                return (
+                  <div
+                    key={skin.id}
+                    className={`${styles.card} ${isUnlocked ? styles.cardUnlocked : ''} ${
+                      !canAfford && !isUnlocked ? styles.cardLocked : ''
+                    }`}
+                  >
+                    <div className={styles.cardHeader}>
+                      <h3 className={styles.cardTitle}>{skin.name}</h3>
+                      <div className={styles.cardCost}>
+                        {isUnlocked ? (
+                          <span className={styles.unlocked}>✓ UNLOCKED</span>
+                        ) : (
+                          <span className={styles.cost}>{skin.cost} NP</span>
+                        )}
+                      </div>
+                    </div>
+                    <div className={styles.cardType}>{skin.character.toUpperCase()} SKIN</div>
+                    <div className={styles.cardDescription}>{skin.description}</div>
+                    {!isUnlocked && (
+                      <button
+                        type="button"
+                        className={styles.purchaseBtn}
+                        onClick={() => handlePurchaseSkin(skin)}
+                        disabled={!canAfford}
+                      >
+                        {canAfford ? 'UNLOCK' : 'INSUFFICIENT NP'}
+                      </button>
+                    )}
+                  </div>
+                );
+              })}
+            </div>
+          )}
+
+          {/* Upgrades Tab */}
+          {activeTab === 'upgrades' && (
+            <div className={styles.upgradesGrid}>
+              {/* Group by tier */}
+              {[1, 2, 3].map((tier) => {
+                const tierUpgrades = PERMANENT_UPGRADES.filter((u) => u.tier === tier);
+                return (
+                  <div key={tier} className={styles.tierSection}>
+                    <h2 className={styles.tierTitle}>Tier {tier}</h2>
+                    <div className={styles.grid}>
+                      {tierUpgrades.map((upgrade) => {
+                        const currentLevel = metaProgress.permanentUpgrades[upgrade.id] || 0;
+                        const isMaxed = currentLevel >= upgrade.maxLevel;
+                        const canAfford = metaProgress.nicePoints >= upgrade.cost;
+
+                        return (
+                          <div
+                            key={upgrade.id}
+                            className={`${styles.card} ${isMaxed ? styles.cardUnlocked : ''} ${
+                              !canAfford && !isMaxed ? styles.cardLocked : ''
+                            }`}
+                          >
+                            <div className={styles.cardHeader}>
+                              <h3 className={styles.cardTitle}>{upgrade.name}</h3>
+                              <div className={styles.cardCost}>
+                                {isMaxed ? (
+                                  <span className={styles.maxed}>MAX</span>
+                                ) : (
+                                  <span className={styles.cost}>{upgrade.cost} NP</span>
+                                )}
+                              </div>
+                            </div>
+                            <div className={styles.upgradeLevel}>
+                              Level: {currentLevel} / {upgrade.maxLevel}
+                            </div>
+                            <div className={styles.cardDescription}>{upgrade.description}</div>
+                            {!isMaxed && (
+                              <button
+                                type="button"
+                                className={styles.purchaseBtn}
+                                onClick={() => handlePurchaseUpgrade(upgrade)}
+                                disabled={!canAfford}
+                              >
+                                {canAfford ? 'UPGRADE' : 'INSUFFICIENT NP'}
+                              </button>
+                            )}
+                          </div>
+                        );
+                      })}
+                    </div>
+                  </div>
+                );
+              })}
+            </div>
+          )}
+        </div>
+      </div>
+    </div>
+  );
+}
+
+/**
+ * Button component to open workshop from main menu
+ */
+interface WorkshopButtonProps {
+  onOpen: () => void;
+}
+
+export function WorkshopButton({ onOpen }: WorkshopButtonProps) {
+  const handleOpen = () => {
+    onOpen();
+    AudioManager.playSFX('ui_select');
+  };
+
+  return (
+    <button type="button" className={styles.workshopBtn} onClick={handleOpen}>
+      🎄 SANTA'S WORKSHOP
+    </button>
+  );
+}

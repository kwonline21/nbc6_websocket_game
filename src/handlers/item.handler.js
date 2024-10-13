import { addItem, getUserItems } from '../models/item.model.js';
import { getGameAssets } from '../init/assets.js';
import { getStage } from '../models/stage.model.js';

export const handleItemPickup = (userId, payload) => {
  const { items, itemUnlocks } = getGameAssets();
  const { timestamp, itemId } = payload;

  // 아이템 정보 조회
  const item = items.data.find((item) => item.id === itemId);
  if (!item) {
    return { status: 'fail', message: 'Invalid item ID' };
  }

  // 유저의 현재 스테이지 정보 조회
  const currentStages = getStage(userId);
  if (!currentStages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }
  const currentStage = currentStages[currentStages.length - 1].id;

  // 현재 스테이지에서 나올 수 있는 아이템인지 검증
  const allowedItems = itemUnlocks.data.find((stage) => stage.stage_id === currentStage).item_ids;
  if (!allowedItems.includes(itemId)) {
    return { status: 'fail', message: 'Item not allowed in current stage' };
  }

  // 아이템 기록 추가
  addItem(userId, { id: itemId, timestamp });
  return { status: 'success', handler: 21 };
};

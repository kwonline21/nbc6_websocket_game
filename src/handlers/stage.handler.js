import { getGameAssets } from '../init/assets.js';
import { getStage, setStage } from '../models/stage.model.js';
import calculateTotalScore from '../utils/calculateTotalScore.js';

export const moveStageHandler = (userId, payload) => {
  // 유저의 현재 스테이지 배열
  let currentStages = getStage(userId);
  // 유저의 현재 스테이지 배열이 비어있으면 'fail' 처리
  if (!currentStages.length) {
    return { status: 'fail', message: 'No stages found for user' };
  }

  // 오름차순 정렬 후 현재 스테이지 정보 추출
  currentStages.sort((a, b) => a.id - b.id);
  const currentStage = currentStages[currentStages.length - 1];

  // 서버와 클라이언트의 현재 스테이지 정보 비교
  if (currentStage.id !== payload.currentStage) {
    return { status: 'fail', message: 'Current Stage mismatch' };
  }

  // 게임 에셋에서 스테이지 정보 가져오기
  const { stages } = getGameAssets();

  // 현재 스테이지 정보를 stageTable에서 가져와서, 유효한지 검증
  const currentStageInfo = stages.data.find((stage) => stage.id === payload.currentStage);
  if (!currentStageInfo) {
    return { status: 'fail', message: 'Current stage info not found' };
  }

  // 목표 스테이지 정보를 stageTable에서 가져와서, 유효한지 검증
  const targetStageInfo = stages.data.find((stage) => stage.id === payload.targetStage);
  if (!currentStageInfo) {
    return { status: 'fail', message: 'Target stage info not found' };
  }

  // 점수 검증
  const serverTime = Date.now(); // 현재 타임스탬프
  const totalScore = calculateTotalScore(currentStages, serverTime, true); // 유저의 현재 스테이지 배열, 현재 타임스탬프, ?

  // 총 점수가 목표 스테이지 점수에 못 미치는 경우 'fail' 처리
  if (targetStageInfo.score > totalScore) {
    return { status: 'fail', message: 'Invalid elapsed time' };
  }

  // 유저의 다음 스테이지 정보 업데이트 + 현재 시간
  setStage(userId, payload.targetStage, serverTime); // uuid, 이동한 stage 정보, 이동한 stage 시작 시간
  return { status: 'success', handler: 11 };
};

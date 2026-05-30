import type { FaultCodeExplanation } from "@/types/mechanical";

const FAULT_CODES: Record<string, FaultCodeExplanation> = {
  P0300: {
    code: "P0300",
    title: "اختلال في احتراق المحرك (Random Misfire)",
    humanExplanation:
      "المحرك لا يحرق الوقود بسلاسة في بعض اللحظات. قد تشعر برجفة أو ضعف بسيط في العزم، خصوصاً عند التسارع أو الوقوف.",
    recommendedAction:
      "افحص البواجي (شمعات الإشعال) والكويلات وحقن الوقود، وتأكد من نظافة فلتر الهواء.",
    urgency: "high",
  },
  P0420: {
    code: "P0420",
    title: "كفاءة المحفز الحفّاز أقل من اللازم",
    humanExplanation:
      "المحفّز الحفّاز في نظام العادم (الكتلايست) لا يعمل بكفاءته المطلوبة، مما يزيد الانبعاثات تدريجياً.",
    recommendedAction:
      "تحقق أولاً من حساس الأكسجين، وإن كان سليماً قد تحتاج لاستبدال الكتلايست خلال الأشهر القادمة.",
    urgency: "medium",
  },
  P0171: {
    code: "P0171",
    title: "خليط الوقود فقير (Lean)",
    humanExplanation:
      "كمية الهواء التي تدخل المحرك أكثر من كمية الوقود. قد تلاحظ ضعف عزم أو استهلاك غير منتظم.",
    recommendedAction:
      "افحص تسريبات الهواء حول مشعب السحب (مانيفولد)، ونظّف حساس MAF، وتأكد من سلامة بخاخات الوقود.",
    urgency: "medium",
  },
  P0455: {
    code: "P0455",
    title: "تسريب كبير في نظام تبخّر الوقود (EVAP)",
    humanExplanation:
      "هناك تسريب في نظام أبخرة خزان الوقود، وغالباً السبب هو غطاء خزان الوقود غير محكم.",
    recommendedAction:
      "تأكد من إغلاق غطاء الخزان بإحكام أولاً، فإن استمر الكود فحص خراطيم EVAP وصمام Purge.",
    urgency: "low",
  },
  P0128: {
    code: "P0128",
    title: "حرارة المحرك لا تصل للقيمة المطلوبة",
    humanExplanation:
      "المحرك يبقى أبرد مما يجب، وغالباً السبب الثرموستات لا يغلق بشكل صحيح، مما يرفع استهلاك الوقود.",
    recommendedAction:
      "استبدل الثرموستات، وتحقق من حساس حرارة سائل التبريد، وتأكد من مستوى الماء في الردياتير.",
    urgency: "low",
  },
};

export function getFaultCodeExplanation(
  code: string
): FaultCodeExplanation | null {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return null;
  return FAULT_CODES[normalized] ?? null;
}

export const KNOWN_FAULT_CODES: readonly string[] = Object.keys(FAULT_CODES);

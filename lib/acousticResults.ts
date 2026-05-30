import type { AcousticDiagnosisResult } from "@/types/mechanical";

export const ACOUSTIC_RESULTS: AcousticDiagnosisResult[] = [
  {
    title: "صوت محرك طبيعي",
    description:
      "نمط الصوت يبدو متوازناً ومتناغماً، ولا توجد إشارات لاهتزازات غير معتادة.",
    severity: "normal",
    recommendation:
      "تابع جدول الصيانة الدوري، ولا حاجة لإجراء عاجل في الوقت الحالي.",
  },
  {
    title: "احتمال مشكلة في سير المحرك",
    description:
      "تم اكتشاف صفير متكرر منخفض التردد قد يدل على تآكل أو ارتخاء في سير المحرك.",
    severity: "warning",
    recommendation:
      "افحص حالة السير وتوتره خلال الأيام القادمة، وفكّر باستبداله إن كان متشققاً.",
  },
  {
    title: "صوت طقطقة في الصمامات",
    description:
      "صوت طقطقة متقطع في الجزء العلوي من المحرك قد يشير إلى مشكلة في خلوصات الصمامات أو شُح الزيت.",
    severity: "warning",
    recommendation:
      "تحقق من مستوى الزيت أولاً، وإذا استمر الصوت احجز موعداً لفحص رؤوس الأسطوانات.",
  },
  {
    title: "اهتزاز غير معتاد في المحرك",
    description:
      "تم رصد ذبذبات منخفضة التردد قد تنتج عن قواعد محرك مهترئة أو خلل في توازن الدوران.",
    severity: "critical",
    recommendation:
      "زر مركز صيانة في أقرب فرصة لفحص قواعد المحرك ونظام التعليق وعدم تحميل السيارة بأحمال زائدة.",
  },
  {
    title: "ضعف محتمل في نظام العادم",
    description:
      "صوت هواء مكتوم وتسريب خفيف قد يدل على تشقّق في كاتم الصوت أو تجمع رواسب في العادم.",
    severity: "warning",
    recommendation:
      "افحص أنبوب العادم بصرياً واستمع لأي تسريب، ويفضل زيارة ورشة عادم خلال أسبوع.",
  },
];

export function getRandomAcousticResult(): AcousticDiagnosisResult {
  const index = Math.floor(Math.random() * ACOUSTIC_RESULTS.length);
  return ACOUSTIC_RESULTS[index];
}

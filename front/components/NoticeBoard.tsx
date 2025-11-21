import { Notice } from "../types";

export default function NoticeBoard({ data }: { data: Notice[] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 shadow-lg">
      <h2 className="text-xl font-bold text-purple-400 uppercase tracking-wide mb-4">
        Notices
      </h2>
      <div className="space-y-4">
        {data.map((notice) => (
          <div
            key={notice.id}
            className="bg-slate-800 p-3 rounded border-l-4 border-purple-500"
          >
            <div className="flex justify-between items-start mb-1">
              <h3 className="text-white font-bold">{notice.title}</h3>
              <span className="text-xs text-slate-500">
                {new Date(notice.notice_date).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-slate-300">{notice.text_content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

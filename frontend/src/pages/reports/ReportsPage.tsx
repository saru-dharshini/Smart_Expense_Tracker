import { useMemo, useState } from 'react';
import api from '../../api/client';

type ReportType = 'pdf' | 'excel';

const ReportsPage = () => {
  const [downloading, setDownloading] = useState<ReportType | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const currentMonthLabel = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    });
  }, []);

  const handleDownload = async (type: ReportType) => {
    setDownloading(type);
    setMessage(null);

    try {
      const endpoint = type === 'pdf' ? '/reports/monthly/pdf' : '/reports/monthly/excel';
      const { data, headers } = await api.get(endpoint, {
        responseType: 'blob',
      });

      const blobUrl = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      const filename =
        headers['content-disposition']?.split('filename=')[1]?.replace(/"/g, '') ||
        `paypulse-report-${type}.${type === 'pdf' ? 'pdf' : 'xlsx'}`;
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);

      setMessage(`Downloaded ${type.toUpperCase()} report successfully.`);
    } catch (err) {
      console.error('Failed to download report', err);
      setMessage('Unable to download report. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="reports-page">
      <div className="dashboard-card reports-card">
        <div className="dashboard-card-header">
          <div>
            <h2 className="dashboard-card-title">Reports</h2>
            <p className="page-subtitle">Export detailed summaries for {currentMonthLabel}.</p>
          </div>
        </div>
        <div className="reports-actions">
          <button
            type="button"
            className="btn-neutral"
            onClick={() => handleDownload('pdf')}
            disabled={downloading !== null}
          >
            {downloading === 'pdf' ? 'Downloading...' : 'Download PDF (This Month)'}
          </button>
          <button
            type="button"
            className="btn-neutral"
            onClick={() => handleDownload('excel')}
            disabled={downloading !== null}
          >
            {downloading === 'excel' ? 'Downloading...' : 'Download Excel (This Month)'}
          </button>
        </div>
        {message && <div className="reports-message">{message}</div>}
      </div>
    </div>
  );
};

export default ReportsPage;


// Заглушка для сотрудника без доступных разделов.

export default function NoAccessPage() {
  return (
    <div className="admin-body">
      <div className="acard" style={{ maxWidth: 520, textAlign: "center", padding: 40 }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
        <h2 style={{ fontSize: 22, marginBottom: 10 }}>Доступ ограничен</h2>
        <p className="ahint" style={{ margin: 0 }}>
          У вашей учётной записи пока нет доступа ни к одному разделу панели. Обратитесь к владельцу,
          чтобы он назначил вам права в разделе «Сотрудники».
        </p>
      </div>
    </div>
  );
}

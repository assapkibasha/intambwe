// src/pages/InventoryReports.jsx
import { useState, useEffect } from 'react';
import { Card, Table, Button, message, Spin, Row, Col, Statistic, Select } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import reportApi from '../api/reportApi';

const InventoryReports = () => {
  const [reports, setReports] = useState([]);
  const [stockBalance, setStockBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reportsRes, balanceRes] = await Promise.all([
        reportApi.getReports({ limit: 100, report_type: reportType !== 'all' ? reportType : undefined }),
        reportApi.getStockBalanceReport(),
      ]);
      setReports(reportsRes.data.data);
      setStockBalance(balanceRes.data);
    } catch (error) {
      message.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (type) => {
    setLoading(true);
    try {
      await reportApi.generateReport({ report_type: type });
      message.success('Report generated successfully');
      fetchData();
    } catch (error) {
      message.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (report) => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = `report-${report.report_id}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const columns = [
    {
      title: 'Report ID',
      dataIndex: 'report_id',
      key: 'report_id',
    },
    {
      title: 'Type',
      dataIndex: 'report_type',
      key: 'report_type',
      render: (type) => <strong>{type}</strong>,
    },
    {
      title: 'Total Items',
      dataIndex: 'total_items',
      key: 'total_items',
    },
    {
      title: 'Total Value',
      dataIndex: 'total_value',
      key: 'total_value',
      render: (value) => `$${value?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Low Stock Items',
      dataIndex: 'low_stock_items_count',
      key: 'low_stock',
    },
    {
      title: 'Generated Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          size="small"
          icon={<DownloadOutlined />}
          onClick={() => handleExport(record)}
        >
          Export
        </Button>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ padding: '20px' }}>
        <h1>Inventory Reports</h1>

        {/* Stock Balance Summary */}
        {stockBalance && (
          <Row gutter={16} style={{ marginBottom: '20px' }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Items"
                  value={stockBalance.summary?.totalItems || 0}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Quantity"
                  value={stockBalance.summary?.totalQuantity || 0}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Total Value"
                  value={`$${(stockBalance.summary?.totalValue || 0).toFixed(2)}`}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Low Stock Items"
                  value={stockBalance.summary?.lowStockCount || 0}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Generate Report Section */}
        <Card style={{ marginBottom: '20px' }}>
          <h3>Generate New Report</h3>
          <Button onClick={() => handleGenerateReport('daily')} style={{ marginRight: '10px' }}>
            Daily Report
          </Button>
          <Button onClick={() => handleGenerateReport('weekly')} style={{ marginRight: '10px' }}>
            Weekly Report
          </Button>
          <Button onClick={() => handleGenerateReport('monthly')}>
            Monthly Report
          </Button>
        </Card>

        {/* Reports List */}
        <Card title="Generated Reports">
          <Select
            style={{ marginBottom: '20px', width: 200 }}
            placeholder="Filter by type"
            onChange={(value) => {
              setReportType(value);
              fetchData();
            }}
          >
            <Select.Option value="all">All Reports</Select.Option>
            <Select.Option value="daily">Daily</Select.Option>
            <Select.Option value="weekly">Weekly</Select.Option>
            <Select.Option value="monthly">Monthly</Select.Option>
          </Select>

          <Table
            columns={columns}
            dataSource={reports}
            rowKey="report_id"
            pagination={{ pageSize: 20 }}
            size="small"
          />
        </Card>
      </div>
    </Spin>
  );
};

export default InventoryReports;

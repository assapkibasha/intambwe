// src/pages/InventoryDashboard.jsx
import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Button, Space, Popconfirm, message, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import inventoryApi from '../api/inventoryApi';

const InventoryDashboard = () => {
  const [stats, setStats] = useState(null);
  const [items, setItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [expiredItems, setExpiredItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, itemsRes, lowRes, expiredRes] = await Promise.all([
        inventoryApi.getInventoryStats(),
        inventoryApi.getItems({ limit: 100 }),
        inventoryApi.getLowStockItems({ limit: 100 }),
        inventoryApi.getExpiredItems({ limit: 100 }),
      ]);

      setStats(statsRes.data.data);
      setItems(itemsRes.data.data);
      setLowStockItems(lowRes.data.data);
      setExpiredItems(expiredRes.data.data);
    } catch (error) {
      message.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await inventoryApi.deleteItem(id);
      message.success('Item deleted successfully');
      fetchData();
    } catch (error) {
      message.error('Failed to delete item');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'SKU',
      dataIndex: 'stock_keeping_unit',
      key: 'sku',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty) => <span style={{ fontWeight: 'bold' }}>{qty}</span>,
    },
    {
      title: 'Min Level',
      dataIndex: 'minimum_stock_level',
      key: 'min_level',
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'price',
      render: (price) => `$${price?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = { active: 'green', inactive: 'orange', discontinued: 'red' };
        return <span style={{ color: colors[status] }}>{status}</span>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" size="small" icon={<EyeOutlined />} />
          <Button size="small" icon={<EditOutlined />} />
          <Popconfirm
            title="Delete Item"
            description="Are you sure you want to delete this item?"
            onConfirm={() => handleDelete(record.item_id)}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ padding: '20px' }}>
        <h1>Inventory Management Dashboard</h1>

        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: '20px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Items"
                value={stats?.totalItems || 0}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Items"
                value={stats?.activeItems || 0}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Low Stock Items"
                value={stats?.lowStockItems || 0}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Expired Items"
                value={stats?.expiredItems || 0}
                valueStyle={{ color: '#f5222d' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Actions */}
        <div style={{ marginBottom: '20px' }}>
          <Button type="primary" icon={<PlusOutlined />} size="large">
            Add New Item
          </Button>
        </div>

        {/* Tables */}
        <Row gutter={16}>
          <Col xs={24}>
            <Card title="All Items">
              <Table
                columns={columns}
                dataSource={items}
                rowKey="item_id"
                pagination={{ pageSize: 10 }}
                size="small"
              />
            </Card>
          </Col>
        </Row>

        {lowStockItems.length > 0 && (
          <Row gutter={16} style={{ marginTop: '20px' }}>
            <Col xs={24}>
              <Card title="Low Stock Items" style={{ borderTop: '4px solid #faad14' }}>
                <Table
                  columns={columns}
                  dataSource={lowStockItems}
                  rowKey="item_id"
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        )}

        {expiredItems.length > 0 && (
          <Row gutter={16} style={{ marginTop: '20px' }}>
            <Col xs={24}>
              <Card title="Expired Items" style={{ borderTop: '4px solid #f5222d' }}>
                <Table
                  columns={columns}
                  dataSource={expiredItems}
                  rowKey="item_id"
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </Spin>
  );
};

export default InventoryDashboard;

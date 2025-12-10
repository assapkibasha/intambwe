// src/pages/PurchaseOrders.jsx
import { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Tag, message, Spin, Modal, Input } from 'antd';
import { PlusOutlined, EyeOutlined } from '@ant-design/icons';
import purchaseOrderApi from '../api/purchaseOrderApi';
import inventoryApi from '../api/inventoryApi';
import supplierApi from '../api/supplierApi';
import PurchaseOrderForm from '../components/PurchaseOrderForm';

const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [posRes, itemsRes, suppliersRes] = await Promise.all([
        purchaseOrderApi.getPurchaseOrders({ limit: 100, q: searchText }),
        inventoryApi.getItems({ limit: 1000 }),
        supplierApi.getSuppliers({ limit: 1000 }),
      ]);
      setPurchaseOrders(posRes.data.data);
      setItems(itemsRes.data.data);
      setSuppliers(suppliersRes.data.data);
    } catch (error) {
      message.error('Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePO = async (values) => {
    try {
      await purchaseOrderApi.createPurchaseOrder(values);
      message.success('Purchase order created successfully');
      setModalVisible(false);
      fetchData();
    } catch (error) {
      message.error('Failed to create purchase order');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'blue',
      ordered: 'cyan',
      partially_received: 'orange',
      received: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'PO Number',
      dataIndex: 'po_number',
      key: 'po_number',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Supplier',
      dataIndex: ['Supplier', 'name'],
      key: 'supplier',
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount) => `$${amount?.toFixed(2) || '0.00'}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Order Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Expected Delivery',
      dataIndex: 'expected_delivery_date',
      key: 'expected_delivery_date',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <div style={{ padding: '20px' }}>
        <h1>Purchase Orders</h1>

        <Card>
          <Space style={{ marginBottom: '20px', width: '100%', justifyContent: 'space-between' }}>
            <Input
              placeholder="Search PO number..."
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                fetchData();
              }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
              Create Purchase Order
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={purchaseOrders}
            rowKey="po_id"
            pagination={{ pageSize: 20 }}
            size="small"
          />
        </Card>

        <Modal
          title="Create Purchase Order"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={800}
        >
          <PurchaseOrderForm
            suppliers={suppliers}
            items={items}
            onSubmit={handleCreatePO}
            loading={loading}
          />
        </Modal>
      </div>
    </Spin>
  );
};

export default PurchaseOrders;

// src/components/PurchaseOrderForm.jsx
import { useState, useEffect } from 'react';
import { Form, Button, Select, Input, DatePicker, Table, InputNumber, Space, Spin, message } from 'antd';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const PurchaseOrderForm = ({ suppliers, items, onSubmit, loading }) => {
  const [form] = Form.useForm();
  const [poItems, setPoItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(null);
  const [unitPrice, setUnitPrice] = useState(null);

  const addItem = () => {
    if (!selectedItem || !quantity || !unitPrice) {
      message.error('Please fill in all fields');
      return;
    }

    const item = items.find(i => i.item_id === selectedItem);
    setPoItems([
      ...poItems,
      {
        key: Date.now(),
        item_id: selectedItem,
        name: item?.name,
        quantity_ordered: quantity,
        unit_price: unitPrice,
        line_total: quantity * unitPrice,
      }
    ]);

    setSelectedItem(null);
    setQuantity(null);
    setUnitPrice(null);
  };

  const removeItem = (key) => {
    setPoItems(poItems.filter(item => item.key !== key));
  };

  const handleSubmit = (values) => {
    if (poItems.length === 0) {
      message.error('Please add at least one item');
      return;
    }

    const totalAmount = poItems.reduce((sum, item) => sum + item.line_total, 0);
    onSubmit({
      ...values,
      expected_delivery_date: values.expected_delivery_date?.toISOString(),
      items: poItems.map(({ key, name, ...item }) => item),
      total_amount: totalAmount,
    });
  };

  const columns = [
    {
      title: 'Item',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity_ordered',
      key: 'quantity_ordered',
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (price) => `$${price.toFixed(2)}`,
    },
    {
      title: 'Line Total',
      dataIndex: 'line_total',
      key: 'line_total',
      render: (total) => `$${total.toFixed(2)}`,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <DeleteOutlined onClick={() => removeItem(record.key)} style={{ color: 'red', cursor: 'pointer' }} />
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="supplier_id"
          label="Supplier"
          rules={[{ required: true, message: 'Please select a supplier' }]}
        >
          <Select placeholder="Select supplier">
            {suppliers?.map(sup => (
              <Select.Option key={sup.supplier_id} value={sup.supplier_id}>
                {sup.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="expected_delivery_date"
          label="Expected Delivery Date"
        >
          <DatePicker />
        </Form.Item>

        <Form.Item
          name="notes"
          label="Notes"
        >
          <Input.TextArea rows={3} placeholder="Purchase order notes" />
        </Form.Item>

        <div style={{ marginBottom: '20px' }}>
          <h4>Add Items</h4>
          <Space style={{ marginBottom: '10px' }}>
            <Select
              style={{ width: 200 }}
              placeholder="Select item"
              value={selectedItem}
              onChange={setSelectedItem}
            >
              {items?.map(item => (
                <Select.Option key={item.item_id} value={item.item_id}>
                  {item.name}
                </Select.Option>
              ))}
            </Select>
            <InputNumber
              min={1}
              placeholder="Quantity"
              value={quantity}
              onChange={setQuantity}
            />
            <InputNumber
              min={0}
              step={0.01}
              placeholder="Unit Price"
              value={unitPrice}
              onChange={setUnitPrice}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={addItem}>
              Add Item
            </Button>
          </Space>

          <Table
            columns={columns}
            dataSource={poItems}
            pagination={false}
            size="small"
          />
        </div>

        <Space>
          <Button type="primary" htmlType="submit" loading={loading}>
            Create Purchase Order
          </Button>
          <Button>Cancel</Button>
        </Space>
      </Form>
    </Spin>
  );
};

export default PurchaseOrderForm;

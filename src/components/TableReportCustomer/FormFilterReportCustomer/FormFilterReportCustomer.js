import { useDispatch, useSelector } from "react-redux";
import { Button, Col, DatePicker, Form, InputNumber, Row, Select } from "antd";
import { useMediaQuery } from "react-responsive";
import { useEffect, useState } from "react";
import moment from "moment/moment";
import dayjs from "dayjs";
import { useQuery } from "@apollo/client";
import locale from "antd/es/date-picker/locale/vi_VN";
import "dayjs/locale/vi";
import { fetchApiAllFactory } from "../../../redux/slices/factorySlice/factorySlice";
import {
  fetchApiAllFactorySelector,
  fetchApiGetAllKieuDongHoSelector,
} from "../../../redux/selector";
import customerSlice, {
  fetchApiGetListReportCustomerNew,
} from "../../../redux/slices/customerSlice/customerSlice";
import { GetUserQuery } from "../../../graphql/users/usersQuery";
import { getAllDMTotalByType } from "../../../redux/slices/DmTotalSlice/DmTotalSlice";

function FormFilterReportCustomer() {
  const [ngayLapDat, setNgayLapDat] = useState(null);
  const [ngayKyHopDong, setKyHopDong] = useState(null);
  const [ngaySuDung, setNgaySuDung] = useState(null);

  const dispatch = useDispatch();

  const factoryNames = useSelector(fetchApiAllFactorySelector);
  const kieuDongHos = useSelector(fetchApiGetAllKieuDongHoSelector);
  const { data: users } = useQuery(GetUserQuery);

  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 991px)" });

  const layout = {
    labelCol: {
      span: `${isTabletOrMobile ? 6 : 4}`,
    },
    wrapperCol: {
      span: 24,
    },
  };

  useEffect(() => {
    dispatch(fetchApiAllFactory());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handle submit form
  const handleSubmit = (values) => {
    dispatch(fetchApiGetListReportCustomerNew(values));
    dispatch(
      customerSlice.actions.btnFilterBangKeKH({
        listNhaMayId: values.listNhaMayId,
      })
    );
  };

  // handle submit error
  const handleFailed = (error) => {
    console.log({ error });
  };

  // handle change ngày lắp đặt
  const handleChangeNgayLapDat = (date) => {
    if (date) {
      const lastDayOfMonth = moment(date).endOf("month");
      setNgayLapDat(lastDayOfMonth);
    }
  };

  // handle change ngày đăng ký hợp đồng
  const handleChangeNgayDangKyHopDong = (date) => {
    if (date) {
      const lastDayOfMonth = moment(date).endOf("month");
      setKyHopDong(lastDayOfMonth);
    }
  };

  // handle change ngày sử dụng
  const handleChangeNgaySuDung = (date) => {
    if (date) {
      const lastDayOfMonth = moment(date).endOf("month");
      setNgaySuDung(lastDayOfMonth);
    }
  };

  // handle get all (kiểu đồng hồ)
  const handleGetAllKieuDH = () => {
    dispatch(getAllDMTotalByType(7));
  };

  return (
    <Form
      {...layout}
      onFinish={handleSubmit}
      onFinishFailed={handleFailed}
      fields={[
        { name: "listNhaMayId", value: factoryNames[0]?.id },
        { name: "ngayLapDatEnd", value: ngayLapDat ? dayjs(ngayLapDat) : "" },
        {
          name: "ngayKyHopDongEnd",
          value: ngayKyHopDong ? dayjs(ngayKyHopDong) : "",
        },
        { name: "ngaySuDungEnd", value: ngaySuDung ? dayjs(ngaySuDung) : "" },
      ]}
    >
      <Row gutter={24}>
        {/* Đơn vị + Nhân viên */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="listNhaMayId" label="Đơn vị: ">
            <Select
              style={{ fontWeight: "bolder" }}
              size="small"
              fieldNames="listNhaMayId"
            >
              {factoryNames?.length > 0
                ? factoryNames?.map((_factory) => {
                    return (
                      <Select.Option key={_factory.id} value={_factory.id}>
                        {_factory.tenNhaMay}
                      </Select.Option>
                    );
                  })
                : []}
            </Select>
          </Form.Item>
        </Col>

        {/* Nhân viên */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="nhanVienXem" label="Nhân viên: ">
            <Select
              fieldNames="nhanVienXem"
              style={{ fontWeight: "bolder" }}
              size="small"
              options={
                users?.GetUsers?.nodes?.length <= 0
                  ? []
                  : users?.GetUsers?.nodes?.map((_nameManager) => ({
                      label: _nameManager.userName,
                      value: _nameManager.id,
                    }))
              }
              placeholder="Chọn nhân viên"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* Từ ngày (Ngày lắp đặt) */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="ngayLapDatStart" label="Từ ngày: ">
            <DatePicker
             style={{ fontWeight: "bolder" }}
              size="small"
              name="ngayLapDatStart"
              className="date-time-inp"
              placeholder="Chọn ngày lắp đặt"
              onChange={handleChangeNgayLapDat}
              locale={locale}
              format={"DD/MM/YYYY"}
            />
          </Form.Item>
        </Col>

        {/*  Đến ngày (Ngày lắp đặt) */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="ngayLapDatEnd" label="Đến ngày: ">
            <DatePicker
             style={{ fontWeight: "bolder" }}
              size="small"
              name="ngayLapDatEnd"
              className="date-time-inp"
              placeholder="Chọn ngày lắp đặt"
              locale={locale}
              format={"DD/MM/YYYY"}
              // disabledDate={(current) => {
              //   return current && current < moment().startOf("day");
              // }}
              // value={endDate}
            />
          </Form.Item>
        </Col>

        {/*  Từ ngày (Ngày đăng ký hợp đồng) */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="ngayKyHopDongStart" label="Từ ngày: ">
            <DatePicker
            style={{ fontWeight: "bolder" }}
              size="small"
              name="ngayKyHopDongStart"
              className="date-time-inp"
              placeholder="Chọn ngày đăng ký hợp đồng"
              onChange={handleChangeNgayDangKyHopDong}
              locale={locale}
              format={"DD/MM/YYYY"}
            />
          </Form.Item>
        </Col>

        {/*  Đến ngày (Ngày đăng ký hợp đồng) */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="ngayKyHopDongEnd" label="Đến ngày: ">
            <DatePicker
            style={{ fontWeight: "bolder" }}
              size="small"
              name="ngayKyHopDongEnd"
              className="date-time-inp"
              placeholder="Chọn ngày đăng ký hợp đồng"
              locale={locale}
              format={"DD/MM/YYYY"}
            />
          </Form.Item>
        </Col>

        {/*  Từ ngày (Ngày sử dụng) */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="ngaySuDungStart" label="Từ ngày: ">
            <DatePicker
            style={{ fontWeight: "bolder" }}
              size="small"
              name="ngaySuDungStart"
              className="date-time-inp"
              placeholder="Chọn ngày sử dụng"
              onChange={handleChangeNgaySuDung}
              locale={locale}
              format={"DD/MM/YYYY"}
            />
          </Form.Item>
        </Col>

        {/*  Đến ngày (Ngày sử dụng) */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="ngaySuDungEnd" label="Đến ngày: ">
            <DatePicker
            style={{ fontWeight: "bolder" }}
              size="small"
              name="ngaySuDungEnd"
              className="date-time-inp"
              placeholder="Chọn ngày sử dụng"
              locale={locale}
              format={"DD/MM/YYYY"}
            />
          </Form.Item>
        </Col>
      </Row>

      {/* Checkbox */}
      {/* <Row>
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item
            rules={[
              {
                required: false,
              },
            ]}
            valuePropName="checked"
            hasFeedback
            name="no_val_one"
            label="Chọn"
          >
            <Checkbox>Không có giá trị</Checkbox>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item
            rules={[
              {
                required: false,
              },
            ]}
            hasFeedback
            valuePropName="checked"
            name="no_val_two"
            label="Chọn"
            className={isTabletOrMobile ? "gutter-item-mobile" : "gutter-item"}
          >
            <Checkbox>Không có giá trị</Checkbox>
          </Form.Item>
        </Col>
      </Row> */}

      {/* Kiểu đồng hồ + Kích cỡ */}
      <Row gutter={24}>
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="loaiDongHo" label="Kiểu đồng hồ">
            <Select
            style={{ fontWeight: "bolder" }}
              size="small"
              fieldNames="loaiDongHo"
              placeholder="Chọn kiểu đồng hồ"
              onClick={handleGetAllKieuDH}
            >
              <Select.Option value="">Tất cả</Select.Option>
              {kieuDongHos?.map((_type) => {
                return (
                  <Select.Option key={_type.id}>{_type.value}</Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="kickCo" label="Kích cỡ: ">
            <InputNumber
            style={{ fontWeight: "bolder",width: "100%" }}
              size="small"
              name="kickCo"
              placeholder="Kích cỡ"
              
            />
          </Form.Item>
        </Col>

        <Col xs={24} sm={24} md={24} lg={24}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              htmlType="submit"
              className="gutter-item-btn custom-btn-watch-report"
            >
              Xem báo cáo
            </Button>
          </div>
        </Col>
      </Row>
    </Form>
  );
}

export default FormFilterReportCustomer;

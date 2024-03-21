import { useDispatch, useSelector } from "react-redux";
import { Button, Col, DatePicker, Form, Input, Row, Select } from "antd";
import { useMediaQuery } from "react-responsive";
import moment from "moment";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import locale from "antd/es/date-picker/locale/vi_VN";
import "dayjs/locale/vi";
import {
  btnClickGetFactoryIdSelector,
  fetchApiAllFactorySelector,
  fetchApiAllPriceObjectSelector,
  fetchApiGetAllKieuDongHoSelector,
} from "../../../redux/selector";
import customerSlice, {
  fetchApiGetListOfCustomer,
} from "../../../redux/slices/customerSlice/customerSlice";
import { fetchApiAllPriceObject } from "../../../redux/slices/priceObjectSlice/priceObjectSlice";
import { GetAllHuyen, GetXaTuHuyen } from "../../../graphql/wards/wardQuery";
import { GetUserQuery } from "../../../graphql/users/usersQuery";
import { getAllDMTotalByType } from "../../../redux/slices/DmTotalSlice/DmTotalSlice";
import { LOAD_TUYEN_DOC_BY_NHA_MAY_ID } from "../../../graphql/reading/queries";

const pageSizeTuyenDoc = 10;

function FormFilterCustomer() {
  const [ngayLapDat, setNgayLapDat] = useState(null);
  const [ngayKyHopDong, setKyHopDong] = useState(null);
  const [ngaySuDung, setNgaySuDung] = useState(null);
  const [huyenId, setHuyenId] = useState("");
  const [isFetchingMoreTuyenDoc, setIsFetchingMoreTuyenDoc] = useState(false);
  const [factoryIdArr, setFactoryIdArr] = useState([]);

  const dispatch = useDispatch();

  // get from redux
  const factoryId = useSelector(btnClickGetFactoryIdSelector);
  const factoryNames = useSelector(fetchApiAllFactorySelector);
  const priceObjs = useSelector(fetchApiAllPriceObjectSelector);
  // const readings = useSelector(fetchApiAllReadingSelector);
  const kieuDongHos = useSelector(fetchApiGetAllKieuDongHoSelector);

  //get array nhaMayId
  useEffect(() => {
    let factory = [];
    if (factoryId === "all") {
      factory = JSON.parse(sessionStorage.getItem("nhaMaysData")).map(
        (factory) => factory.nhaMayId
      );
    } else {
      factory = [factoryId];
    }
    console.log(factory);
    setFactoryIdArr(factory);
  }, [factoryId]);

  // get from graphql
  const { data: huyens } = useQuery(GetAllHuyen);
  const { data: xas } = useQuery(GetXaTuHuyen, {
    variables: { quanHuyenId: huyenId || "" },
  });
  const { data: users } = useQuery(GetUserQuery);
  const { data: tuyenDocs, fetchMore: fetchMoreTuyenDoc } = useQuery(
    LOAD_TUYEN_DOC_BY_NHA_MAY_ID,
    {
      variables: {
        first: pageSizeTuyenDoc,
        nhaMayId: factoryIdArr ? factoryIdArr : null,
      },
    }
  );

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
    dispatch(fetchApiAllPriceObject());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // handle submit form
  const handleSubmit = (values) => {
    dispatch(fetchApiGetListOfCustomer(values));
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

  // handle fetch more data -> tuyến đọc theo nhà máy
  const handleOnPopupScrollTuyenDoc = (e) => {
    const { target } = e;

    if (
      isFetchingMoreTuyenDoc ||
      !tuyenDocs?.GetTuyenDocs.pageInfo.hasNextPage
    ) {
      return;
    }

    if (target.scrollHeight - target.scrollTop === target.clientHeight) {
      setIsFetchingMoreTuyenDoc(true);

      fetchMoreTuyenDoc({
        variables: {
          first: pageSizeTuyenDoc,
          after: tuyenDocs?.GetTuyenDocs.pageInfo.endCursor,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;

          if (tuyenDocs?.GetTuyenDocs.pageInfo.hasNextPage) {
            // Update data when click change page
            const updateData = {
              GetTuyenDocs: {
                ...prev.GetTuyenDocs,
                nodes: [
                  ...prev.GetTuyenDocs.nodes,
                  ...fetchMoreResult.GetTuyenDocs.nodes,
                ],
                pageInfo: fetchMoreResult.GetTuyenDocs.pageInfo,
              },
            };

            setIsFetchingMoreTuyenDoc(false);

            return updateData;
          }
        },
      });
    }
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

  // handle change option (huyện)
  const handleChangeOptionDistrict = (value) => {
    setHuyenId(value);
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
        { name: "trangThaiSuDung", value: 1 },
        { name: "ngayLapDatEnd", value: ngayLapDat ? dayjs(ngayLapDat) : "" },
        {
          name: "ngayKyHopDongEnd",
          value: ngayKyHopDong ? dayjs(ngayKyHopDong) : "",
        },
        { name: "ngaySuDungEnd", value: ngaySuDung ? dayjs(ngaySuDung) : "" },
        { name: "loaiKhachHang", value: "" },
      ]}
    >
      <Row gutter={24}>
        {/* Đơn vị */}
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

        {/* Người quản lý */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="nguoiQuanLyId" label="Nhân viên: ">
            <Select
              style={{ fontWeight: "bolder" }}
              size="small"
              fieldNames="nguoiQuanLyId"
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

        {/* Tìm kiếm tuyến */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="tiemKiemTuyen" label="Tìm tuyến: ">
            <Input
              style={{ fontWeight: "bolder" }}
              size="small"
              name="tiemKiemTuyen"
              placeholder="Tìm kiếm tuyến"
            />
          </Form.Item>
        </Col>

        {/* Tuyến đọc */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="tuyenDoc" label="Tuyến đọc: ">
            <Select
              style={{ fontWeight: "bolder" }}
              size="small"
              fieldNames="tuyenDoc"
              placeholder="Chọn tuyến đọc"
              onPopupScroll={handleOnPopupScrollTuyenDoc}
            >
              <Select.Option value="">Tất cả</Select.Option>
              {tuyenDocs?.GetTuyenDocs?.nodes?.length <= 0
                ? []
                : tuyenDocs?.GetTuyenDocs?.nodes?.map((_reading) => {
                    return (
                      <Select.Option key={_reading.id} value={_reading.id}>
                        {_reading.tenTuyen}
                      </Select.Option>
                    );
                  })}
            </Select>
          </Form.Item>
        </Col>

        {/* Đối tượng giá */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="doiTuongGia" label="Đối tượng giá">
            <Select
              style={{ fontWeight: "bolder" }}
              size="small"
              fieldNames="doiTuongGia"
              placeholder="Chọn đối tượng giá"
            >
              <Select.Option value="">Tất cả</Select.Option>
              {priceObjs?.length <= 0
                ? []
                : priceObjs?.map((_price) => {
                    return (
                      <Select.Option key={_price.id} value={_price.id}>
                        {_price.keyId}
                      </Select.Option>
                    );
                  })}
            </Select>
          </Form.Item>
        </Col>

        {/* Kiểu đồng hồ */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="loaiDongHo" label="Kiểu ĐH">
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

        {/* Kích cỡ */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="duongKinh" label="Kích cỡ: ">
            <Input
              style={{ fontWeight: "bolder" }}
              size="small"
              name="duongKinh"
              placeholder="Kích cỡ"
            />
          </Form.Item>
        </Col>

        {/* Tình trạng đồng hồ */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="trangThaiSuDung" label="Tình trạng">
            <Select
              style={{ fontWeight: "bolder" }}
              size="small"
              fieldNames="trangThaiSuDung"
              options={[
                // { label: "Tất cả", value: "" },
                { label: "Đang sử dụng", value: 1 },
                { label: "Ngưng sử dụng", value: 2 },
                { label: "Hủy", value: 3 },
              ]}
              placeholder="Chọn tình trạng của đồng hồ"
            />
          </Form.Item>
        </Col>

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

        {/* Quận/ Huyện */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="quanHuyenId" label="Quận/ Huyện">
            <Select
              style={{ fontWeight: "bolder" }}
              size="small"
              fieldNames="quanHuyenId"
              placeholder="Chọn quận - huyện"
              onChange={handleChangeOptionDistrict}
            >
              <Select.Option value="">Tất cả</Select.Option>
              {huyens?.GetQuanHuyens?.nodes?.map((_district) => {
                return (
                  <Select.Option key={_district.id} value={_district.id}>
                    {_district.ten}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Col>

        {/* Xã/ Phường */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="xaPhuongId" label="Xã/ Phường">
            <Select
              style={{ fontWeight: "bolder" }}
              size="small"
              fieldNames="xaPhuongId"
              placeholder="Chọn xã - phường"
            >
              <Select.Option value="">Tất cả</Select.Option>
              {xas?.GetPhuongXas?.nodes?.map((_ward) => {
                return (
                  <Select.Option key={_ward.keyId} value={_ward.keyId}>
                    {_ward.ten}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Col>

        {/* Loại khách hàng */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="loaiKhachHang" label="Loại KH">
            <Select
              style={{ fontWeight: "bolder" }}
              size="small"
              fieldNames="loaiKhachHang"
              options={[
                { value: "CaNhan", label: "1 - Cá nhân" },
                { value: "DonViToChuc", label: "2 - Đơn vị, tổ chức" },
                { value: "", label: "Tất cả" },
              ]}
              placeholder="Chọn loại khách hàng"
            />
          </Form.Item>
        </Col>

        {/* Khu vực thanh toán */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="khuVucThanhToan" label="Khu vực TT">
            <Select
              style={{ fontWeight: "bolder" }}
              size="small"
              fieldNames="khuVucThanhToan"
              options={[{ value: "", label: "Tất cả" }]}
              placeholder="Chọn khu vực thanh toán"
            />
          </Form.Item>
        </Col>

        {/* Hình thức thanh toán */}
        <Col xs={24} sm={12} md={12} lg={12}>
          <Form.Item name="phuongThucThanhToanId" label="Hình thức TT">
            <Select
              style={{ fontWeight: "bolder" }}
              size="small"
              fieldNames="phuongThucThanhToanId"
              options={[
                { value: "", label: "Tất cả" },
                { value: "ChuyenKhoan", label: "Chuyển khoản" },
                { value: "TienMat", label: "Tiền mặt" },
                { value: "TmCk", label: "TM hoặc CK" },
                { value: "TruLuong", label: "Trừ lương" },
              ]}
              placeholder="Chọn hình thức thanh toán"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row>
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

export default FormFilterCustomer;

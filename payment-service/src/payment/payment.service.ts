import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { Payment } from './entities/payment.entity';
import { InjectModel } from '@nestjs/sequelize';
import generateOrderId from 'src/utils/generateTransaksiId';
import { HttpService } from '@nestjs/axios';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { catchError, firstValueFrom, lastValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ClientProxy } from '@nestjs/microservices';

const SEND_NOTIFICATION_SERVICE = 'SEND_NOTIFICATION_SERVICE';

@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment)
    private paymentModel: typeof Payment,
    private readonly httpService: HttpService,

    @Inject('NOTIFICATION_SERVICE')
    private readonly notificationClient: ClientProxy,
  ) {}

  private async requestMidtrans(orderId: string, price: number): Promise<any> {
    const midtransUrl = process.env.MIDTRANS_URL;
    const base64ServerKey = Buffer.from(
      `${process.env.MIDTRANS_SERVER_KEY}:`,
    ).toString('base64');

    const { data } = await firstValueFrom(
      this.httpService
        .post(
          midtransUrl,
          {
            payment_type: 'bank_transfer',
            transaction_details: {
              order_id: orderId,
              gross_amount: price,
            },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${base64ServerKey}`,
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw new InternalServerErrorException(error.message);
          }),
        ),
    );
    return data;
  }

  async create(createPaymentDto: CreatePaymentDto) {
    const transaksiId = generateOrderId();

    const midtransData = await this.requestMidtrans(
      transaksiId,
      createPaymentDto.price,
    );

    const payment = await this.paymentModel.create({
      userId: createPaymentDto.userId,
      paymentUrl: midtransData.redirect_url,
      transaksiId,
      type: createPaymentDto.type,
      status: 'pending',
      price: createPaymentDto.price,
      limit: createPaymentDto.limit,
    });

    if (!payment) {
      throw new InternalServerErrorException('Failed to create payment');
    }

    // Send notification to notification service
    try {
      await lastValueFrom(
        this.notificationClient.emit(SEND_NOTIFICATION_SERVICE, {
          userId: createPaymentDto.userId,
          message: 'You just made payment link',
          status: 'unread',
        }),
      );
    } catch (error) {
      console.error('Failed to send notification:', error.message);
    }

    return {
      payment,
      midtrans: midtransData.data,
    };
  }

  async findAll(userId: string) {
    const getPayments = await this.paymentModel.findAll({
      where: {
        userId,
      },
      order: [['createdAt', 'DESC']],
    });

    return getPayments;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  async update(updatePaymentDto: UpdatePaymentStatusDto) {
    const findTransaksiId = await this.paymentModel.findOne({
      where: {
        transaksiId: updatePaymentDto.order_id,
      },
    });

    if (!findTransaksiId) {
      throw new NotFoundException('Transaction not found');
    }

    if (updatePaymentDto.transaction_status === 'settlement') {
      const updateLimitUser = await this.httpService.axiosRef.put(
        'http://localhost:8081/api/user/updateLimit',
        {
          userId: findTransaksiId.userId,
          limit: findTransaksiId.limit,
        },
      );

      // Send notification to notification service
      try {
        lastValueFrom(
          this.notificationClient.emit(SEND_NOTIFICATION_SERVICE, {
            userId: findTransaksiId.userId,
            message: 'Your payment has been successfully!',
            status: 'unread',
          }),
        );
      } catch (error) {
        console.log(error);
        throw new ServiceUnavailableException(
          'Notification service is unavailable, reason: ' + error.message,
        );
      }

      if (updateLimitUser.data.status !== 200) {
        throw new InternalServerErrorException('Failed to update user limit');
      }
    }

    return this.paymentModel.update(
      {
        status:
          updatePaymentDto.transaction_status === 'settlement'
            ? 'success'
            : 'pending',
      },
      {
        where: {
          transaksiId: updatePaymentDto.order_id,
        },
      },
    );
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}
